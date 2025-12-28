-- Consolidated Update Script
-- This script ensures all necessary columns exist before migrating data

-- 1. Ensure 'due_date' exists in 'activity_checklist'
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[activity_checklist]') AND name = 'due_date')
BEGIN
    ALTER TABLE [dbo].[activity_checklist] ADD [due_date] [date] NULL;
    PRINT 'Added due_date to activity_checklist';
END
GO

-- 2. Ensure 'is_deleted' exists in 'activity_checklist'
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[activity_checklist]') AND name = 'is_deleted')
BEGIN
    ALTER TABLE [dbo].[activity_checklist] ADD [is_deleted] [bit] NOT NULL DEFAULT ((0));
    PRINT 'Added is_deleted to activity_checklist';
END
GO

-- 3. Ensure 'assigned_to' exists in 'note'
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[note]') AND name = 'assigned_to')
BEGIN
    ALTER TABLE [dbo].[note] ADD [assigned_to] [varchar](9) NULL;
    PRINT 'Added assigned_to to note';
END
GO

-- 4. Migrate Data from Checklist to Notes
-- Only migrates items that haven't been migrated yet to avoid duplicates
INSERT INTO [dbo].[note] (
    [entity_type],
    [entity_id],
    [title],
    [body],
    [status],
    [due_date],
    [created_by],
    [created_at],
    [assigned_to]
)
SELECT
    'activity',
    CAST([activity_id] AS nvarchar(100)),
    [item_text],
    CASE WHEN [category] IS NOT NULL THEN [category] + ': ' + [item_text] ELSE [item_text] END,
    CASE WHEN [is_completed] = 1 THEN 'done' ELSE 'open' END,
    [due_date],
    'migration',
    SYSDATETIME(),
    [assigned_to_volunteer_id]
FROM [dbo].[activity_checklist]
WHERE [is_deleted] = 0
AND NOT EXISTS (
    SELECT 1 FROM [dbo].[note]
    WHERE [entity_type] = 'activity'
    AND [entity_id] = CAST([activity_checklist].[activity_id] AS nvarchar(100))
    AND [title] = [activity_checklist].[item_text]
);
GO

PRINT 'Migration completed successfully.';
