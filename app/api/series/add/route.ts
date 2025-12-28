import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("seasons", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      season_id,
      name,
      description,
      status,
      start_date,
      end_date, // This might be calculated if Fixed
      lead_national_id,
      notes,
      is_default,
      // New fields
      group_id,
      schedule_type,
      default_day,
      default_start_time,
      default_end_time,
      frequency,
      occurrences_count,
      manual_activities, // Array of {date, start_time, end_time} for Manual schedule
      default_activity_kind // New field for activity kind
    } = body;

    if (!season_id || !name?.trim()) {
      return NextResponse.json(
        { error: "season_id and name are required" },
        { status: 400 }
      );
    }

    // Validate dates against season
    const seasonResult = await query(
      `SELECT start_date, end_date FROM season_plan WHERE id = @season_id`,
      { season_id: Number(season_id) }
    );

    if (seasonResult.recordset.length > 0) {
      const season = seasonResult.recordset[0];
      const seasonStart = new Date(season.start_date);
      const seasonEnd = new Date(season.end_date);
      
      if (start_date) {
        const seriesStart = new Date(start_date);
        if (seriesStart < seasonStart) {
          return NextResponse.json(
            { error: "תאריך התחלת הסדרה חייב להיות בתוך טווח תאריכי העונה" },
            { status: 400 }
          );
        }
      }
    }

    const trimmedName = name.trim();

    let finalEndDate = end_date;
    
    // Logic to calculate end_date if Fixed schedule
    if (schedule_type === 'Fixed' && start_date && occurrences_count && frequency) {
        const start = new Date(start_date);
        let end = new Date(start);
        const count = parseInt(occurrences_count);
        
        if (frequency === 'Weekly') {
            end.setDate(start.getDate() + (count - 1) * 7);
        } else if (frequency === 'Daily') {
            end.setDate(start.getDate() + (count - 1));
        } else if (frequency === 'Monthly') {
            end.setMonth(start.getMonth() + (count - 1));
        }
        finalEndDate = end.toISOString().split('T')[0];
    }

    const payload = {
      season_id: Number(season_id),
      name: trimmedName,
      description: description?.trim() || null,
      status: status?.trim() || null,
      start_date: start_date || null,
      end_date: finalEndDate || null,
      lead_national_id: lead_national_id?.trim() || null,
      notes: notes?.trim() || null,
      is_default: Boolean(is_default) ? 1 : 0,
      // New fields mapping
      group_id: group_id || null,
      schedule_type: schedule_type || null,
      default_day: default_day ? Number(default_day) : null,
      default_start_time: default_start_time || null,
      default_end_time: default_end_time || null,
      frequency: frequency || null,
      occurrences_count: occurrences_count ? Number(occurrences_count) : null,
      default_activity_kind: default_activity_kind || 'גלישה'
    };

    // If setting as default, clear other defaults for this season
    if (payload.is_default) {
      await query(
        `
          UPDATE season_activity_series
          SET is_default = 0
          WHERE season_id = @season_id
        `,
        { season_id: payload.season_id }
      );
    }

    const insertSql = `
      INSERT INTO season_activity_series (
        season_id,
        name,
        description,
        status,
        start_date,
        end_date,
        lead_national_id,
        notes,
        is_default,
        group_id,
        schedule_type,
        default_day,
        default_start_time,
        default_end_time,
        frequency,
        occurrences_count,
        default_activity_kind
      )
      OUTPUT INSERTED.id
      VALUES (
        @season_id,
        @name,
        @description,
        @status,
        @start_date,
        @end_date,
        @lead_national_id,
        @notes,
        @is_default,
        @group_id,
        @schedule_type,
        @default_day,
        @default_start_time,
        @default_end_time,
        @frequency,
        @occurrences_count,
        @default_activity_kind
      )
    `;

    const result = await query(insertSql, payload);
    const seriesId = result.recordset[0].id;

    // Generate Activities Logic
    const activities: any[] = [];

    if (schedule_type === 'Fixed' && start_date && occurrences_count) {
        const count = parseInt(occurrences_count);
        const startDate = new Date(start_date);
        
        for (let i = 0; i < count; i++) {
            const actDate = new Date(startDate);
            if (frequency === 'Weekly') {
                actDate.setDate(startDate.getDate() + i * 7);
            } else if (frequency === 'Daily') {
                actDate.setDate(startDate.getDate() + i);
            } else if (frequency === 'Monthly') {
                actDate.setMonth(startDate.getMonth() + i);
            }
            
            activities.push({
                activity_date: actDate.toISOString().split('T')[0],
                start_time: default_start_time,
                end_time: default_end_time
            });
        }
    } else if (schedule_type === 'Manual' && manual_activities && Array.isArray(manual_activities)) {
        manual_activities.forEach((act: any) => {
            if (act.date) {
                activities.push({
                    activity_date: act.date,
                    start_time: act.start_time || null,
                    end_time: act.end_time || null
                });
            }
        });
    }

    if (activities.length > 0) {
        for (const activity of activities) {
            await query(`
                INSERT INTO activity (
                    season_id, series_id, group_id, kind, activity_date, start_time, end_time,
                    status, activity_manager_id
                ) VALUES (
                    @season_id, @series_id, @group_id, @kind, @activity_date, @start_time, @end_time,
                    @status, @activity_manager_id
                )
            `, {
                season_id: payload.season_id,
                series_id: seriesId,
                group_id: payload.group_id,
                kind: payload.default_activity_kind, // Use the selected kind
                activity_date: activity.activity_date,
                start_time: activity.start_time,
                end_time: activity.end_time,
                status: 'מתוכנן',
                activity_manager_id: payload.lead_national_id
            });
        }
    }

    return NextResponse.json({ success: true, id: seriesId });
  } catch (err: any) {
    console.error("Error adding activity series:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
