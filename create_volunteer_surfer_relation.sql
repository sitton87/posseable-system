-- טבלת קשר בין מתנדבי מים לגולשים
-- מאפשרת לעקוב אחרי עם אילו גולשים מתנדב עבד ובאילו פעילויות

CREATE TABLE volunteer_surfer_activity (
  id INT IDENTITY(1,1) PRIMARY KEY,
  volunteer_national_id VARCHAR(9) NOT NULL,
  surfer_national_id VARCHAR(9) NOT NULL,
  activity_id INT NOT NULL,
  activity_date DATETIME2 NOT NULL DEFAULT GETDATE(),
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

  -- Foreign Keys
  CONSTRAINT FK_volunteer_surfer_volunteer
    FOREIGN KEY (volunteer_national_id)
    REFERENCES volunteer(national_id),

  CONSTRAINT FK_volunteer_surfer_surfer
    FOREIGN KEY (surfer_national_id)
    REFERENCES surfer(national_id),

  CONSTRAINT FK_volunteer_surfer_activity
    FOREIGN KEY (activity_id)
    REFERENCES activity(id)
);

-- אינדקסים לשיפור ביצועים
CREATE INDEX IX_volunteer_surfer_volunteer
  ON volunteer_surfer_activity(volunteer_national_id);

CREATE INDEX IX_volunteer_surfer_surfer
  ON volunteer_surfer_activity(surfer_national_id);

CREATE INDEX IX_volunteer_surfer_activity_date
  ON volunteer_surfer_activity(activity_date);

-- הערות:
-- טבלה זו מאפשרת:
-- 1. לראות עבור כל מתנדב - עם אילו גולשים הוא עבד ובאילו פעילויות
-- 2. לראות עבור כל גולש - אילו מתנדבים תמכו בו
-- 3. לספור כמה פעמים מתנדב עבד עם גולש מסוים
-- 4. לקשר את הנתונים לפעילות ספציפית