ALTER TABLE fee_installments
  ADD COLUMN paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER amount;
