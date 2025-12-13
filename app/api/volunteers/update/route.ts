import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
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
      classification,
    } = body;

    // Validation
    if (!national_id || !full_name) {
      return NextResponse.json(
        { error: "national_id and full_name are required" },
        { status: 400 }
      );
    }

    // Update volunteer
    await query(
      `UPDATE volunteer
       SET full_name = @full_name,
           phone = @phone,
           email = @email,
           kind = @kind,
           street = @street,
           house_number = @house_number,
           city = @city,
           join_date = @join_date,
           training_date = @training_date,
           profession = @profession,
           sea_connection_level = @sea_connection_level,
           active = @active,
           notes = @notes,
           volunteer_type = @volunteer_type,
           media_specialization = @media_specialization,
           availability = @availability,
           personal_website = @personal_website,
           documents = @documents,
           classification = @classification
       WHERE national_id = @national_id`,
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
        classification: classification || "volunteer",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Volunteer updated successfully",
    });
  } catch (err: any) {
    console.error("Error updating volunteer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const national_id = searchParams.get("national_id");

    if (!national_id) {
      return NextResponse.json(
        { error: "national_id is required" },
        { status: 400 }
      );
    }

    // Soft delete - just mark as inactive
    await query(`UPDATE volunteer SET active = 0 WHERE national_id = @national_id`, {
      national_id,
    });

    return NextResponse.json({
      success: true,
      message: "Volunteer deactivated successfully",
    });
  } catch (err: any) {
    console.error("Error deleting volunteer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}