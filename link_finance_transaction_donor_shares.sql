-- Creates relation table to support multiple donors per finance transaction (donations)
IF OBJECT_ID('dbo.finance_transaction_donor', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.finance_transaction_donor (
    finance_transaction_id INT NOT NULL,
    donor_id VARCHAR(9) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_finance_transaction_donor PRIMARY KEY (finance_transaction_id, donor_id),
    CONSTRAINT FK_finance_transaction_donor_shares_transaction
      FOREIGN KEY (finance_transaction_id) REFERENCES dbo.finance_transaction(id) ON DELETE CASCADE,
    CONSTRAINT FK_finance_transaction_donor_shares_donor
      FOREIGN KEY (donor_id) REFERENCES dbo.donor(national_id)
  );
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_finance_transaction_donor_transaction'
    AND object_id = OBJECT_ID('dbo.finance_transaction_donor')
)
BEGIN
  CREATE INDEX IX_finance_transaction_donor_transaction
    ON dbo.finance_transaction_donor(finance_transaction_id);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_finance_transaction_donor_donor'
    AND object_id = OBJECT_ID('dbo.finance_transaction_donor')
)
BEGIN
  CREATE INDEX IX_finance_transaction_donor_donor
    ON dbo.finance_transaction_donor(donor_id);
END;

