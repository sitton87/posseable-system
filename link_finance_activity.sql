-- Creates the finance_transaction table (if missing) and links it to activities

IF OBJECT_ID('dbo.finance_transaction', 'U') IS NULL
BEGIN
  PRINT 'Creating finance_transaction table';
  CREATE TABLE dbo.finance_transaction (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transaction_date DATE NOT NULL,
    type NVARCHAR(20) NOT NULL,
    category NVARCHAR(200) NOT NULL,
    description NVARCHAR(400) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    donor_id VARCHAR(9) NULL,
    supplier_id VARCHAR(20) NULL,
    notes NVARCHAR(MAX) NULL,
    activity_id INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;

IF COL_LENGTH('dbo.finance_transaction', 'activity_id') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD activity_id INT NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'donor_id') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD donor_id VARCHAR(9) NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'supplier_id') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD supplier_id VARCHAR(20) NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'description') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD description NVARCHAR(400) NOT NULL DEFAULT N'';
END;

IF COL_LENGTH('dbo.finance_transaction', 'paid_by') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD paid_by NVARCHAR(200) NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'payment_details') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD payment_details NVARCHAR(MAX) NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'has_invoice') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD has_invoice BIT NULL CONSTRAINT DF_finance_transaction_has_invoice DEFAULT 0;
END;

IF COL_LENGTH('dbo.finance_transaction', 'invoice_number') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD invoice_number NVARCHAR(100) NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'attachment_name') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD attachment_name NVARCHAR(255) NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'attachment_mime') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD attachment_mime NVARCHAR(100) NULL;
END;

IF COL_LENGTH('dbo.finance_transaction', 'attachment_data') IS NULL
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD attachment_data VARBINARY(MAX) NULL;
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_finance_transaction_activity'
)
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD CONSTRAINT FK_finance_transaction_activity
    FOREIGN KEY (activity_id) REFERENCES dbo.activity(id);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_finance_transaction_donor'
)
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD CONSTRAINT FK_finance_transaction_donor
    FOREIGN KEY (donor_id) REFERENCES dbo.donor(national_id);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_finance_transaction_supplier'
)
BEGIN
  ALTER TABLE dbo.finance_transaction
  ADD CONSTRAINT FK_finance_transaction_supplier
    FOREIGN KEY (supplier_id) REFERENCES dbo.supplier(supplier_identifier);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_finance_transaction_activity_id'
    AND object_id = OBJECT_ID('dbo.finance_transaction')
)
BEGIN
  CREATE INDEX IX_finance_transaction_activity_id
    ON dbo.finance_transaction(activity_id);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_finance_transaction_type_date'
    AND object_id = OBJECT_ID('dbo.finance_transaction')
)
BEGIN
  CREATE INDEX IX_finance_transaction_type_date
    ON dbo.finance_transaction(type, transaction_date);
END;

