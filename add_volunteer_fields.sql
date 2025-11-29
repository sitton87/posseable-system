-- הוספת שדות חדשים לטבלת volunteer
-- הרץ את הסקריפט הזה רק אם השדות עדיין לא קיימים

USE PosseableDB;
GO

-- בדוק אם העמודות כבר קיימות, ואם לא - הוסף אותן
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('volunteer') AND name = 'volunteer_type')
BEGIN
    ALTER TABLE volunteer ADD volunteer_type NVARCHAR(50) NULL;
    PRINT 'Added column: volunteer_type';
END
ELSE
BEGIN
    PRINT 'Column volunteer_type already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('volunteer') AND name = 'media_specialization')
BEGIN
    ALTER TABLE volunteer ADD media_specialization NVARCHAR(100) NULL;
    PRINT 'Added column: media_specialization';
END
ELSE
BEGIN
    PRINT 'Column media_specialization already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('volunteer') AND name = 'availability')
BEGIN
    ALTER TABLE volunteer ADD availability NVARCHAR(MAX) NULL;
    PRINT 'Added column: availability';
END
ELSE
BEGIN
    PRINT 'Column availability already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('volunteer') AND name = 'personal_website')
BEGIN
    ALTER TABLE volunteer ADD personal_website NVARCHAR(500) NULL;
    PRINT 'Added column: personal_website';
END
ELSE
BEGIN
    PRINT 'Column personal_website already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('volunteer') AND name = 'documents')
BEGIN
    ALTER TABLE volunteer ADD documents NVARCHAR(MAX) NULL;
    PRINT 'Added column: documents';
END
ELSE
BEGIN
    PRINT 'Column documents already exists';
END

GO

-- הערות:
-- 1. השדות הם NULL כדי לאפשר גמישות
-- 2. documents נשמר כ-JSON string שיכיל מערך של מסמכים
-- 3. availability יכול להכיל טקסט חופשי או מבנה JSON של ימים ושעות
-- 4. הסקריפט בודק אם העמודות כבר קיימות לפני שמנסה להוסיף אותן