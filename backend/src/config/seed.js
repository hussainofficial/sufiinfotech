// Creates the first super-admin account so you can log in to the admin panel.
// Usage: node src/config/seed.js "Admin Name" admin@example.com "somePassword123"
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Usage: node src/config/seed.js "Admin Name" admin@example.com "somePassword123"');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, 'super_admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [name, email, passwordHash]
  );

  console.log(`Admin account ready: ${email}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
