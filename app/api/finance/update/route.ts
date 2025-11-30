import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

type DonorShareInput = { donor_id: string; amount: number };

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("finance", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      id,
      transaction_date,
      type,
      category,
      amount,
      description,
      supplier_id,
      notes,
      activity_id,
      paid_by,
      payment_details,
      has_invoice,
      invoice_number,
      attachment,
      donor_shares,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    const isDonation = type === "income" && category === "תרומה";
    let validatedShares: DonorShareInput[] = [];

    if (isDonation) {
      if (!Array.isArray(donor_shares) || donor_shares.length === 0) {
        return NextResponse.json(
          { error: "נדרש לבחור לפחות תורם אחד עבור תרומה" },
          { status: 400 }
        );
      }

      validatedShares = donor_shares.map((share: any) => {
        if (!share.donor_id || !/^\d{9}$/.test(share.donor_id)) {
          throw new Error("תעודת זהות תורם אינה תקינה");
        }
        const shareAmount = parseFloat(share.amount);
        if (!shareAmount || shareAmount <= 0) {
          throw new Error("סכום תרומה לתורם חייב להיות חיובי");
        }
        return { donor_id: share.donor_id, amount: shareAmount };
      });

      const sharesTotal = validatedShares.reduce(
        (sum, share) => sum + share.amount,
        0
      );

      if (Math.abs(sharesTotal - parsedAmount) > 0.01) {
        return NextResponse.json(
          { error: "סכום התרומות לתורמים חייב להשתוות לסכום הכולל" },
          { status: 400 }
        );
      }
    }

    const attachmentBuffer =
      attachment?.data && attachment?.mime
        ? Buffer.from(attachment.data, "base64")
        : null;

    await query(
      `
      UPDATE finance_transaction
      SET
        transaction_date = @transaction_date,
        type = @type,
        category = @category,
        amount = @amount,
        description = @description,
        donor_id = NULL,
        supplier_id = @supplier_id,
        notes = @notes,
        activity_id = @activity_id,
        paid_by = @paid_by,
        payment_details = @payment_details,
        has_invoice = @has_invoice,
        invoice_number = @invoice_number,
        attachment_name = @attachment_name,
        attachment_mime = @attachment_mime,
        attachment_data = CASE
          WHEN @attachment_data IS NULL AND @should_clear_attachment = 0 THEN attachment_data
          ELSE @attachment_data
        END
      WHERE id = @id
    `,
      {
        id,
        transaction_date,
        type,
        category,
        amount: parsedAmount,
        description,
        supplier_id,
        notes,
        activity_id:
          activity_id !== undefined && activity_id !== null
            ? Number(activity_id)
            : null,
        paid_by: paid_by || null,
        payment_details: payment_details || null,
        has_invoice:
          typeof has_invoice === "boolean" ? (has_invoice ? 1 : 0) : null,
        invoice_number: invoice_number || null,
        attachment_name: attachment?.name || null,
        attachment_mime: attachment?.mime || null,
        attachment_data: {
          type: "varbinary(max)",
          value: attachmentBuffer,
        },
        should_clear_attachment: attachment?.clear ? 1 : 0,
      }
    );

    await query(
      `DELETE FROM finance_transaction_donor WHERE finance_transaction_id = @id`,
      { id }
    );

    if (isDonation) {
      for (const share of validatedShares) {
        await query(
          `
          INSERT INTO finance_transaction_donor (
            finance_transaction_id,
            donor_id,
            amount
          )
          VALUES (@finance_transaction_id, @donor_id, @amount)
        `,
          {
            finance_transaction_id: id,
            donor_id: share.donor_id,
            amount: share.amount,
          }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating transaction:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("finance", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    await query(`DELETE FROM finance_transaction WHERE id = @id`, { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting transaction:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
