import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
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
    if (!id || !full_name) {
      return NextResponse.json(
        { error: "id and full_name are required" },
        { status: 400 }
      );
    }

    // Update surfer
    await query(
      `UPDATE surfer 
       SET full_name = @full_name,
           phone = @phone,
           email = @email,
           residence = @residence,
           age = @age,
           date_of_birth = @date_of_birth,
           gender = @gender,
           status = @status,
           program = @program,
           medical_approval = @medical_approval,
           medical_condition = @medical_condition,
           needs_wheelchair = @needs_wheelchair,
           volunteers_needed = @volunteers_needed,
           special_requirements = @special_requirements,
           emergency_contact_name = @emergency_contact_name,
           emergency_contact_phone = @emergency_contact_phone,
           active = @active,
           notes = @notes
       WHERE id = @id`,
      {
        id,
        full_name,
        phone: phone || null,
        email: email || null,
        residence: residence || null,
        age: age || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        status: status || null,
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
      message: "Surfer updated successfully",
    });
  } catch (err: any) {
    console.error("Error updating surfer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Soft delete - just mark as inactive
    await query(`UPDATE surfer SET active = 0 WHERE id = @id`, { id });

    return NextResponse.json({
      success: true,
      message: "Surfer deactivated successfully",
    });
  } catch (err: any) {
    console.error("Error deleting surfer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
