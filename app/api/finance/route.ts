import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const activityId = searchParams.get("activityId");
    const seasonId = searchParams.get("seasonId");

    let sql = `
      SELECT 
        ft.id,
        ft.transaction_date,
        ft.type,
        ft.category,
        ft.amount,
        ft.description,
        ft.donor_id,
        ft.supplier_id,
        ft.notes,
        ft.created_at,
        ft.activity_id,
        a.kind as activity_kind,
        a.activity_date,
        a.season_id as activity_season_id,
        sp.name as season_name,
        sp.year as season_year
      FROM finance_transaction ft
      LEFT JOIN activity a ON ft.activity_id = a.id
      LEFT JOIN season_plan sp ON a.season_id = sp.id
      WHERE 1=1
    `;

    const params: any = {};

    if (type) {
      sql += " AND ft.type = @type";
      params.type = type;
    }

    if (dateFrom) {
      sql += " AND ft.transaction_date >= @dateFrom";
      params.dateFrom = dateFrom;
    }

    if (dateTo) {
      sql += " AND ft.transaction_date <= @dateTo";
      params.dateTo = dateTo;
    }

    if (activityId) {
      sql += " AND ft.activity_id = @activityId";
      params.activityId = Number(activityId);
    }

    if (seasonId) {
      sql += " AND a.season_id = @seasonId";
      params.seasonId = Number(seasonId);
    }

    sql += " ORDER BY ft.transaction_date DESC, ft.created_at DESC";

    const result = await query(sql, params);
    const transactionIds = result.recordset.map((row: any) => row.id);

    let donorShareMap: Record<
      number,
      { donor_id: string; donor_name?: string; amount: number }[]
    > = {};

    if (transactionIds.length) {
      const shareParams: Record<string, any> = {};
      const placeholders = transactionIds
        .map((id, index) => {
          const key = `tx${index}`;
          shareParams[key] = id;
          return `@${key}`;
        })
        .join(", ");

      const shareResult = await query(
        `
        SELECT
          ftd.finance_transaction_id,
          ftd.donor_id,
          ftd.amount,
          d.full_name
        FROM finance_transaction_donor ftd
        INNER JOIN donor d ON d.national_id = ftd.donor_id
        WHERE ftd.finance_transaction_id IN (${placeholders})
      `,
        shareParams
      );

      donorShareMap = shareResult.recordset.reduce(
        (
          acc: Record<
            number,
            { donor_id: string; donor_name?: string; amount: number }[]
          >,
          row: any
        ) => {
          if (!acc[row.finance_transaction_id]) {
            acc[row.finance_transaction_id] = [];
          }
          acc[row.finance_transaction_id].push({
            donor_id: row.donor_id,
            donor_name: row.full_name,
            amount: row.amount,
          });
          return acc;
        },
        {}
      );
    }

    const transactions = result.recordset.map((row: any) => ({
      ...row,
      has_invoice:
        row.has_invoice === null || row.has_invoice === undefined
          ? null
          : Boolean(row.has_invoice),
      attachment_data: row.attachment_data
        ? row.attachment_data.toString("base64")
        : null,
      donor_shares: donorShareMap[row.id] || [],
    }));

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (err: any) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
