import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

type DonorShareInput = { donor_id: string; amount: number };

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("finance", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
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

    if (!transaction_date || !type || !category || !amount || !description) {
      return NextResponse.json(
        {
          error:
            "transaction_date, type, category, amount, and description are required",
        },
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

    const insertResult = await query(
      `
      INSERT INTO finance_transaction (
        transaction_date, type, category, amount, description,
        donor_id, supplier_id, notes, activity_id,
        paid_by, payment_details, has_invoice, invoice_number,
        attachment_name, attachment_mime, attachment_data
      )
      OUTPUT INSERTED.id
      VALUES (
        @transaction_date, @type, @category, @amount, @description,
        NULL, @supplier_id, @notes, @activity_id,
        @paid_by, @payment_details, @has_invoice, @invoice_number,
        @attachment_name, @attachment_mime, @attachment_data
      )
    `,
      {
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
          value:
            attachment?.data && attachment?.mime
              ? Buffer.from(attachment.data, "base64")
              : null,
        },
      }
    );

    const insertedId = insertResult.recordset?.[0]?.id;

    if (!insertedId) {
      throw new Error("Failed to retrieve inserted transaction id");
    }

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
            finance_transaction_id: insertedId,
            donor_id: share.donor_id,
            amount: share.amount,
          }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding transaction:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
