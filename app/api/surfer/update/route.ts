import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

type EmergencyContactInput = {
  full_name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  priority?: number | null;
  notes?: string;
};

export async function PUT(req: Request) {
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
      group_ids,
      medical_approval,
      medical_condition,
      needs_wheelchair,
      volunteers_needed,
      special_requirements,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contacts,
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

    const normalizedGroupIds: string[] = Array.isArray(group_ids)
      ? group_ids.filter(Boolean)
      : [];
    const effectiveGroupId = group_id || normalizedGroupIds[0] || null;
    const contacts: EmergencyContactInput[] = Array.isArray(emergency_contacts)
      ? emergency_contacts
      : [];

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
           group_id = @group_id,
           medical_approval = @medical_approval,
           medical_condition = @medical_condition,
           needs_wheelchair = @needs_wheelchair,
           volunteers_needed = @volunteers_needed,
           special_requirements = @special_requirements,
           emergency_contact_name = @emergency_contact_name,
           emergency_contact_phone = @emergency_contact_phone,
           active = @active,
           notes = @notes
       WHERE national_id = @national_id`,
      {
        national_id,
        full_name,
        phone: phone || null,
        email: email || null,
        residence: residence || null,
        age: age || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        status: status || null,
        program: program || null,
        group_id: effectiveGroupId,
        medical_approval:
          medical_approval !== undefined ? medical_approval : null,
        medical_condition: medical_condition || null,
        needs_wheelchair:
          needs_wheelchair !== undefined ? needs_wheelchair : null,
        volunteers_needed: volunteers_needed || null,
        special_requirements: special_requirements || null,
        emergency_contact_name:
          emergency_contact_name || contacts[0]?.full_name || null,
        emergency_contact_phone:
          emergency_contact_phone || contacts[0]?.phone || null,
        active: active !== undefined ? active : true,
        notes: notes || null,
      }
    );

    // Replace group memberships if provided
    if (Array.isArray(group_ids)) {
      await query(`DELETE FROM surfer_group WHERE surfer_id = @surfer_id`, {
        surfer_id: national_id,
      });

      for (const gid of normalizedGroupIds) {
        await query(
          `INSERT INTO surfer_group (id, surfer_id, group_id, joined_at)
           VALUES (@id, @surfer_id, @group_id, SYSUTCDATETIME())`,
          { id: randomUUID(), surfer_id: national_id, group_id: gid }
        );
      }
    }

    // Replace emergency contacts if provided
    if (Array.isArray(emergency_contacts)) {
      await query(
        `DELETE FROM surfer_emergency_contact WHERE surfer_id = @surfer_id`,
        { surfer_id: national_id }
      );

      for (const contact of contacts) {
        await query(
          `INSERT INTO surfer_emergency_contact (
            contact_id, surfer_id, full_name, relationship, phone, email, priority, notes, created_at
          ) VALUES (
            @contact_id, @surfer_id, @full_name, @relationship, @phone, @email, @priority, @notes, SYSUTCDATETIME()
          )`,
          {
            contact_id: randomUUID(),
            surfer_id: national_id,
            full_name: contact.full_name,
            relationship: contact.relationship || null,
            phone: contact.phone || null,
            email: contact.email || null,
            priority:
              contact.priority !== undefined ? Number(contact.priority) : null,
            notes: contact.notes || null,
          }
        );
      }
    }

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
    const permission = await ensurePermissionResponse("surfers", "write");
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
    await query(`UPDATE surfer SET active = 0 WHERE national_id = @national_id`, {
      national_id,
    });

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
