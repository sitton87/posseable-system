
-- Add is_active column to app_user table
ALTER TABLE [dbo].[app_user] ADD [is_active] [bit] NOT NULL DEFAULT 1;
GO

