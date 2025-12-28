UPDATE activity SET kind = 'surf' WHERE kind = N'גלישה';
UPDATE activity SET kind = 'preparation' WHERE kind = N'הכנה';
UPDATE activity SET kind = 'special' WHERE kind = N'אירוע מיוחד';
UPDATE activity SET kind = 'lecture' WHERE kind = N'הדרכה';
UPDATE activity SET kind = 'other' WHERE kind = N'אחר';
UPDATE activity SET kind = 'social' WHERE kind = N'חברתי'; -- Just in case

-- Also update the series definitions themselves if they store the default kind
UPDATE season_activity_series SET default_activity_kind = 'surf' WHERE default_activity_kind = N'גלישה';
UPDATE season_activity_series SET default_activity_kind = 'preparation' WHERE default_activity_kind = N'הכנה';
UPDATE season_activity_series SET default_activity_kind = 'special' WHERE default_activity_kind = N'אירוע מיוחד';
UPDATE season_activity_series SET default_activity_kind = 'lecture' WHERE default_activity_kind = N'הדרכה';
UPDATE season_activity_series SET default_activity_kind = 'other' WHERE default_activity_kind = N'אחר';

