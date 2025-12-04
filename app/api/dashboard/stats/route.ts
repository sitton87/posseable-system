import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    // Get volunteers stats
    const volunteersResult = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active
      FROM volunteer
    `);

    // Get surfers stats
    const surfersResult = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active
      FROM surfer
    `);

    // Get surfers by program
    const surfersByProgramResult = await query(`
      SELECT 
        program,
        COUNT(*) as count
      FROM surfer
      WHERE active = 1 AND program IS NOT NULL
      GROUP BY program
      ORDER BY count DESC
    `);

    // Get activities stats
    const activitiesResult = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN activity_date >= CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) as upcoming
      FROM activity
    `);

    // Get activities by kind
    const activitiesByKindResult = await query(`
      SELECT 
        kind,
        COUNT(*) as count
      FROM activity
      GROUP BY kind
      ORDER BY count DESC
    `);

    // Get equipment stats
    const equipmentResult = await query(`
      SELECT 
        COUNT(*) AS total,
        SUM(
          CASE 
            WHEN condition IN (N'דורש תיקון', N'לא תקין') THEN 1 
            ELSE 0 
          END
        ) AS needs_repair
      FROM equipment_item
      WHERE is_active = 1
    `);

    // Get donors stats
    const donorsResult = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM donor
    `);

    // Get suppliers stats
    const suppliersResult = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM supplier
    `);

    // Build surfers by program object
    const surfersByProgram: Record<string, number> = {};
    surfersByProgramResult.recordset.forEach((row: any) => {
      surfersByProgram[row.program] = row.count;
    });

    // Build activities by kind object
    const activitiesByKind: Record<string, number> = {};
    activitiesByKindResult.recordset.forEach((row: any) => {
      activitiesByKind[row.kind] = row.count;
    });

    const stats = {
      volunteers: {
        total: volunteersResult.recordset[0].total,
        active: volunteersResult.recordset[0].active || 0,
      },
      surfers: {
        total: surfersResult.recordset[0].total,
        active: surfersResult.recordset[0].active || 0,
        byProgram: surfersByProgram,
      },
      activities: {
        total: activitiesResult.recordset[0].total,
        upcoming: activitiesResult.recordset[0].upcoming || 0,
        byKind: activitiesByKind,
      },
      equipment: {
        total: equipmentResult.recordset[0].total,
        needsRepair: equipmentResult.recordset[0].needs_repair || 0,
      },
      donors: {
        total: donorsResult.recordset[0].total,
        active: donorsResult.recordset[0].active || 0,
      },
      suppliers: {
        total: suppliersResult.recordset[0].total,
        active: suppliersResult.recordset[0].active || 0,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (err: any) {
    console.error("Error fetching dashboard stats:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

