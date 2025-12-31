import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(req: Request) {
  try {
    const permission = await ensurePermissionResponse("donors", "read");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");

    let sql = `
      SELECT 
        d.national_id,
        d.full_name,
        d.organization,
        d.phone,
        d.email,
        d.notes,
        d.is_active,
        d.created_at,
        COALESCE(
          SUM(CASE WHEN ft.id IS NOT NULL THEN ftd.amount ELSE 0 END),
          0
        ) AS total_donations,
        SUM(CASE WHEN ft.id IS NOT NULL THEN 1 ELSE 0 END) AS donation_count,
        MAX(ft.transaction_date) AS last_donation_date
      FROM donor d
      LEFT JOIN finance_transaction_donor ftd
        ON ftd.donor_id = d.national_id
      LEFT JOIN finance_transaction ft
        ON ft.id = ftd.finance_transaction_id
        AND ft.type = 'income'
        AND ft.category = N'תרומה'
      WHERE 1=1
    `;

    if (activeOnly === "true") {
      sql += " AND d.is_active = 1";
    }

    sql += `
      GROUP BY
        d.national_id,
        d.full_name,
        d.organization,
        d.phone,
        d.email,
        d.notes,
        d.is_active,
        d.created_at
      ORDER BY d.full_name ASC
    `;

    const result = await query(sql);
    const statsResult = await query(`
      SELECT
        COUNT(DISTINCT d.national_id) AS total_donors,
        COUNT(DISTINCT CASE WHEN d.is_active = 1 THEN d.national_id END) AS active_donors,
        SUM(CASE WHEN ft.id IS NOT NULL THEN 1 ELSE 0 END) AS total_donation_events,
        COALESCE(
          SUM(CASE WHEN ft.id IS NOT NULL THEN ftd.amount ELSE 0 END),
          0
        ) AS total_donations,
        COALESCE(MAX(CASE WHEN ft.id IS NOT NULL THEN ftd.amount ELSE 0 END), 0) AS highest_donation,
        COALESCE(AVG(NULLIF(CASE WHEN ft.id IS NOT NULL THEN ftd.amount ELSE NULL END, 0)), 0) AS average_donation
      FROM donor d
      LEFT JOIN finance_transaction_donor ftd
        ON ftd.donor_id = d.national_id
      LEFT JOIN finance_transaction ft
        ON ft.id = ftd.finance_transaction_id
        AND ft.type = 'income'
        AND ft.category = N'תרומה'
    `);

    return NextResponse.json({
      success: true,
      donors: result.recordset,
      stats: statsResult.recordset[0] || {
        total_donors: 0,
        active_donors: 0,
        total_donation_events: 0,
        total_donations: 0,
        highest_donation: 0,
        average_donation: 0,
      },
    });
  } catch (err: any) {
    console.error("Error fetching donors:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
