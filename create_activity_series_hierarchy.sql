/* 
  Creates the season_activity_series hierarchy and links activities to it.
  Run this after taking a DB backup.
*/

SET XACT_ABORT ON;
BEGIN TRY
  BEGIN TRANSACTION;

  ------------------------------------------------------------------------------
  -- 1. Create table season_activity_series (if it does not exist yet)
  ------------------------------------------------------------------------------
  IF OBJECT_ID('dbo.season_activity_series', 'U') IS NULL
  BEGIN
    CREATE TABLE dbo.season_activity_series (
      id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
      season_id INT NOT NULL,
      name NVARCHAR(200) NOT NULL,
      description NVARCHAR(1000) NULL,
      status NVARCHAR(50) NULL,
      start_date DATE NULL,
      end_date DATE NULL,
      lead_national_id VARCHAR(9) NULL,
      notes NVARCHAR(MAX) NULL,
      is_default BIT NOT NULL CONSTRAINT DF_season_activity_series_is_default DEFAULT (0),
      created_at DATETIME2 NOT NULL CONSTRAINT DF_season_activity_series_created_at DEFAULT SYSUTCDATETIME(),
      CONSTRAINT FK_season_activity_series_season
        FOREIGN KEY (season_id) REFERENCES dbo.season_plan(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_season_activity_series_season
      ON dbo.season_activity_series(season_id);

    CREATE UNIQUE INDEX UX_season_activity_series_season_name
      ON dbo.season_activity_series(season_id, name);

    CREATE UNIQUE INDEX UX_season_activity_series_default_per_season
      ON dbo.season_activity_series(season_id)
      WHERE is_default = 1;
  END;

  ------------------------------------------------------------------------------
  -- 2. Add column series_id to activity (if missing)
  ------------------------------------------------------------------------------
  IF COL_LENGTH('dbo.activity', 'series_id') IS NULL
  BEGIN
    ALTER TABLE dbo.activity
      ADD series_id INT NULL;
  END;

  ------------------------------------------------------------------------------
  -- 3. Ensure there is one default series per season that already has activities
  ------------------------------------------------------------------------------
  ;WITH SeasonList AS (
    SELECT DISTINCT season_id
    FROM dbo.activity
    WHERE season_id IS NOT NULL
  )
  INSERT INTO dbo.season_activity_series (
    season_id,
    name,
    description,
    status,
    start_date,
    end_date,
    lead_national_id,
    notes,
    is_default
  )
  SELECT
    sl.season_id,
    CONCAT(N'סדרה ראשית לעונה ', COALESCE(sp.name, CAST(sl.season_id AS NVARCHAR(20)))),
    N'סדרה שנוצרה אוטומטית עבור פעילויות קיימות',
    N'פעיל',
    sp.start_date,
    sp.end_date,
    NULL,
    NULL,
    1
  FROM SeasonList sl
  LEFT JOIN dbo.season_plan sp ON sp.id = sl.season_id
  LEFT JOIN dbo.season_activity_series sas
    ON sas.season_id = sl.season_id AND sas.is_default = 1
  WHERE sas.id IS NULL;

  ------------------------------------------------------------------------------
  -- 4. Link existing activities to their season default series (if not linked yet)
  ------------------------------------------------------------------------------
  UPDATE a
  SET series_id = sas.id
  FROM dbo.activity a
  INNER JOIN dbo.season_activity_series sas
    ON sas.season_id = a.season_id AND sas.is_default = 1
  WHERE a.series_id IS NULL;

  ------------------------------------------------------------------------------
  -- 5. Make series_id mandatory and add FK
  ------------------------------------------------------------------------------
  IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.activity')
      AND name = 'series_id'
      AND is_nullable = 1
  )
  BEGIN
    ALTER TABLE dbo.activity
      ALTER COLUMN series_id INT NOT NULL;
  END;

  IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_activity_series'
      AND parent_object_id = OBJECT_ID('dbo.activity')
  )
  BEGIN
    EXEC ('
      ALTER TABLE dbo.activity
        ADD CONSTRAINT FK_activity_series
          FOREIGN KEY (series_id)
          REFERENCES dbo.season_activity_series(id)
          ON DELETE CASCADE;
    ');
  END;

  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0
    ROLLBACK TRANSACTION;

  DECLARE @err NVARCHAR(MAX) =
    CONCAT(
      'Error ', ERROR_NUMBER(), ' (State ', ERROR_STATE(), '): ',
      ERROR_MESSAGE()
    );
  RAISERROR (@err, 16, 1);
END CATCH;

