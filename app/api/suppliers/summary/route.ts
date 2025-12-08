"use server";

import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

const DEFAULT_TASK_LIMIT = 20;
const DEFAULT_ACTIVITY_LIMIT = 10;

export async function GET() {
  try {
    const permission = await ensurePermissionResponse("suppliers", "read");
    if (!permission.allowed) return permission.response;

    const statsResult = await query(`
      SELECT
        (SELECT COUNT(*) FROM supplier) AS total_suppliers,
        (SELECT COUNT(*) FROM supplier WHERE is_active = 1) AS active_suppliers,
        (SELECT COUNT(*) FROM supplier WHERE supplier_type IN ('services','both')) AS service_suppliers,
        (
          SELECT COUNT(*)
          FROM supplier_contract
          WHERE contract_status = 'active'
            AND (end_date IS NULL OR end_date >= CAST(SYSUTCDATETIME() AS DATE))
        ) AS active_contracts
    `);

    const tasksResult = await query(
      `
      SELECT TOP (@limit)
        note_id,
        entity_id,
        title,
        body,
        status,
        priority,
        due_date,
        created_by,
        created_at
      FROM note
      WHERE entity_type = 'supplier'
      ORDER BY created_at DESC
    `,
      { limit: DEFAULT_TASK_LIMIT }
    );

    const activityResult = await query(
      `
      SELECT TOP (@limit)
        activity_id,
        supplier_identifier,
        activity_type,
        related_document_id,
        related_document_type,
        description,
        quantity,
        amount,
        occurred_at
      FROM supplier_activity_log
      ORDER BY occurred_at DESC
    `,
      { limit: DEFAULT_ACTIVITY_LIMIT }
    );

    const statsRow = statsResult.recordset[0] ?? {};

    return NextResponse.json({
      success: true,
      stats: {
        totalSuppliers: statsRow.total_suppliers ?? 0,
        activeSuppliers: statsRow.active_suppliers ?? 0,
        serviceSuppliers: statsRow.service_suppliers ?? 0,
        activeContracts: statsRow.active_contracts ?? 0,
      },
      tasks: tasksResult.recordset ?? [],
      recentActivity: activityResult.recordset ?? [],
    });
  } catch (err: any) {
    console.error("Error fetching supplier summary:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

