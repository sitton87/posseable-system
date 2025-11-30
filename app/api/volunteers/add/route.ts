import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      national_id,
      full_name,
      phone,
      email,
      kind,
      street,
      house_number,
      city,
      join_date,
      training_date,
      profession,
      sea_connection_level,
      active,
      notes,
      volunteer_type,
      media_specialization,
      availability,
      personal_website,
      documents,
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

    // Insert volunteer
    await query(
      `INSERT INTO volunteer (
        national_id, full_name, phone, email, kind,
        street, house_number, city, join_date, training_date,
        total_activities, profession, sea_connection_level,
        active, notes, volunteer_type, media_specialization,
        availability, personal_website, documents
      )
      VALUES (
        @national_id, @full_name, @phone, @email, @kind,
        @street, @house_number, @city, @join_date, @training_date,
        0, @profession, @sea_connection_level,
        @active, @notes, @volunteer_type, @media_specialization,
        @availability, @personal_website, @documents
      )`,
      {
        national_id,
        full_name,
        phone: phone || null,
        email: email || null,
        kind: kind || null,
        street: street || null,
        house_number: house_number || null,
        city: city || null,
        join_date: join_date || null,
        training_date: training_date || null,
        profession: profession || null,
        sea_connection_level: sea_connection_level !== undefined ? sea_connection_level : null,
        active: active !== undefined ? active : true,
        notes: notes || null,
        volunteer_type: volunteer_type || null,
        media_specialization: media_specialization || null,
        availability: availability || null,
        personal_website: personal_website || null,
        documents: documents || null,
      }
    );

    return NextResponse.json({
      success: true,
      national_id,
      message: "Volunteer added successfully",
    });
  } catch (err: any) {
    console.error("Error adding volunteer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}