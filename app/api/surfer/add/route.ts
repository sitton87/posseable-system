import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      full_name,
      phone,
      email,
      residence,
      age,
      date_of_birth,
      gender,
      status,
      program,
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
    if (!full_name) {
      return NextResponse.json(
        { error: "full_name is required" },
        { status: 400 }
      );
    }

    // Generate new GUID for id
    const id = crypto.randomUUID();

    // Insert surfer
    await query(
      `INSERT INTO surfer (
        id, full_name, phone, email, residence, age, date_of_birth,
        gender, status, program, medical_approval, medical_condition,
        needs_wheelchair, volunteers_needed, special_requirements,
        emergency_contact_name, emergency_contact_phone,
        active, notes, created_at
      )
      VALUES (
        @id, @full_name, @phone, @email, @residence, @age, @date_of_birth,
        @gender, @status, @program, @medical_approval, @medical_condition,
        @needs_wheelchair, @volunteers_needed, @special_requirements,
        @emergency_contact_name, @emergency_contact_phone,
        @active, @notes, GETDATE()
      )`,
      {
        id,
        full_name,
        phone: phone || null,
        email: email || null,
        residence: residence || null,
        age: age || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        status: status || "בהמתנה",
        program: program || null,
        medical_approval:
          medical_approval !== undefined ? medical_approval : false,
        medical_condition: medical_condition || null,
        needs_wheelchair:
          needs_wheelchair !== undefined ? needs_wheelchair : false,
        volunteers_needed: volunteers_needed || 1,
        special_requirements: special_requirements || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        active: active !== undefined ? active : true,
        notes: notes || null,
      }
    );

    return NextResponse.json({
      success: true,
      id,
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
