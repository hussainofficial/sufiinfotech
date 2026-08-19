const cron = require('node-cron');
const pool = require('../config/db');
const { sendMail } = require('../utils/mailer');

const REMIND_DAYS_BEFORE = 3;

async function runFeeReminderSweep() {
  // Mark anything past due as overdue.
  await pool.query(
    "UPDATE fee_installments SET status = 'overdue' WHERE status = 'pending' AND due_date < CURDATE()"
  );

  // Remind students whose installment is due within REMIND_DAYS_BEFORE days
  // and hasn't already had a reminder sent today.
  const [dueSoon] = await pool.query(
    `SELECT fi.*, s.name AS student_name, s.email AS student_email, c.title AS course_title
     FROM fee_installments fi
     JOIN fee_plans fp ON fp.id = fi.fee_plan_id
     JOIN students s ON s.id = fp.student_id
     JOIN courses c ON c.id = fp.course_id
     WHERE fi.status IN ('pending', 'overdue')
       AND fi.due_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND (fi.reminder_sent_at IS NULL OR fi.reminder_sent_at < CURDATE())`,
    [REMIND_DAYS_BEFORE]
  );

  for (const installment of dueSoon) {
    const isOverdue = installment.status === 'overdue';
    const sent = await sendMail({
      to: installment.student_email,
      subject: isOverdue ? 'Fee Payment Overdue — Sufi Infotech' : 'Fee Payment Reminder — Sufi Infotech',
      type: 'fee_reminder',
      html: `<p>Hi ${installment.student_name},</p>
             <p>${isOverdue ? 'Your installment for' : 'A reminder that your installment for'}
             <b>${installment.course_title}</b> of amount ₹${installment.amount}
             ${isOverdue ? 'was due on' : 'is due on'} <b>${installment.due_date}</b>.</p>
             <p>Please pay at your earliest convenience to avoid disruption of classes.</p>`,
    });

    if (sent) {
      await pool.query('UPDATE fee_installments SET reminder_sent_at = NOW() WHERE id = ?', [installment.id]);
    }
  }

  console.log(`[fee-reminder] sweep complete, ${dueSoon.length} reminder(s) processed`);
}

function scheduleFeeReminders() {
  // Every day at 9:00 AM server time.
  cron.schedule('0 9 * * *', runFeeReminderSweep);
}

module.exports = { scheduleFeeReminders, runFeeReminderSweep };
