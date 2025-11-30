import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("surfers", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      national_id,
      full_name,
      phone,
      email,
      residence,
      age,
      date_of_birth,
      gender,
      status,
      program,
      group_id,
      medical_approval,
      medical_condition,
      needs_wheelchair,
      volunteers_needed,
      special_requirements,
      emergency_contact_name,
      emergency_contact_phone,
      active,
      notes,
    } = body;

    // Validation
    if (!national_id || !full_name) {
      return NextResponse.json(
        { error: "national_id and full_name are required" },
        { status: 400 }
      );
    }

    // Validate national_id format (9 digits)
    if (!/^\d{9}$/.test(national_id)) {
      return NextResponse.json(
        { error: "national_id must be exactly 9 digits" },
        { status: 400 }
      );
    }

    // Insert surfer
    await query(
      `INSERT INTO surfer (
        national_id, full_name, phone, email, residence, age, date_of_birth,
        gender, status, program, group_id, medical_approval, medical_condition,
        needs_wheelchair, volunteers_needed, special_requirements,
        emergency_contact_name, emergency_contact_phone,
        active, notes
      )
      VALUES (
        @national_id, @full_name, @phone, @email, @residence, @age, @date_of_birth,
        @gender, @status, @program, @group_id, @medical_approval, @medical_condition,
        @needs_wheelchair, @volunteers_needed, @special_requirements,
        @emergency_contact_name, @emergency_contact_phone,
        @active, @notes
      )`,
      {
        national_id,
        full_name,
        phone: phone || null,
        email: email || null,
        residence: residence || null,
        age: age || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        status: status || "בהמתנה",
        program: program || null,
        group_id: group_id || null,
        medical_approval:
          medical_approval !== undefined ? medical_approval : null,
        medical_condition: medical_condition || null,
        needs_wheelchair:
          needs_wheelchair !== undefined ? needs_wheelchair : null,
        volunteers_needed: volunteers_needed || null,
        special_requirements: special_requirements || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        active: active !== undefined ? active : true,
        notes: notes || null,
      }
    );

    return NextResponse.json({
      success: true,
      national_id,
      message: "Surfer added successfully",
    });
  } catch (err: any) {
    console.error("Error adding surfer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
