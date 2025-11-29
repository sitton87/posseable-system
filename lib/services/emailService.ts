import { google } from "googleapis";

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_SENDER_ADDRESS,
  APP_BASE_URL,
} = process.env;

function assertEnv(variable?: string, name?: string) {
  if (!variable) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function getInviteUrl() {
  return `${APP_BASE_URL ?? "https://posseable.org"}/login`;
}

function encodeMessage(message: string) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encodeHeader(text: string) {
  return `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

async function getGmailClient() {
  assertEnv(GMAIL_CLIENT_ID, "GMAIL_CLIENT_ID");
  assertEnv(GMAIL_CLIENT_SECRET, "GMAIL_CLIENT_SECRET");
  assertEnv(GMAIL_REFRESH_TOKEN, "GMAIL_REFRESH_TOKEN");
  assertEnv(GMAIL_SENDER_ADDRESS, "GMAIL_SENDER_ADDRESS");

  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

type EmailPayload = {
  to: string;
  fullName: string;
  temporaryPassword: string;
  nationalId?: string;
  inviteUrl?: string;
  isTest?: boolean;
};

function buildHtmlBody({
  fullName,
  temporaryPassword,
  nationalId,
  inviteUrl,
  isTest,
  to,
}: EmailPayload) {
  const headline = isTest
    ? "בדיקת שליחה - מערכת Posseable"
    : "ברוכים הבאים למערכת Posseable";

  const instructions = isTest
    ? "זהו מייל בדיקה כדי לוודא שהחיבור ל-Gmail פועל."
    : "סיימנו להקים עבורך משתמש חדש במערכת Posseable.";

  return `
    <div dir="rtl" style="font-family:Arial,sans-serif;color:#111">
      <h2>${headline}</h2>
      <p>שלום ${fullName},</p>
      <p>${instructions}</p>
      <p>כדי להשלים כניסה ראשונה השתמש/י בפרטים הבאים:</p>
      <ul style="line-height:1.8">
        <li>
          <strong>שם משתמש (ת"ז):</strong>
          ${nationalId ?? "מספר תעודת הזהות שסיפקת"}
        </li>
        <li>
          <strong>דוא"ל:</strong>
          ${to}
        </li>
        <li>
          <strong>סיסמה זמנית:</strong>
          <span style="font-size:16px">${temporaryPassword}</span>
        </li>
      </ul>
      <p style="margin-top:12px">
        חשוב: יש להזין גם את שם המשתמש (תעודת זהות) וגם את הסיסמה הזמנית כדי להצליח להתחבר.
        לאחר מכן המערכת תבקש ממך להגדיר סיסמה חדשה.
      </p>
      <p>
        <a href="${
          inviteUrl ?? getInviteUrl()
        }" target="_blank" rel="noreferrer"
          style="display:inline-block;background:#0284c7;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">
          כניסה למערכת
        </a>
      </p>
      <p style="color:#555;font-size:14px">
        מומלץ להתחבר ולהחליף סיסמה בהקדם.
      </p>
    </div>
  `;
}

function buildRawEmail(payload: EmailPayload) {
  const subject = payload.isTest
    ? "Posseable - הודעת מערכת (בדיקה)"
    : "Posseable - הודעת מערכת";
  const html = buildHtmlBody(payload);

  const message = [
    `From: Posseable Admin <${GMAIL_SENDER_ADDRESS}>`,
    `To: ${payload.to}`,
    `Subject: ${encodeHeader(subject)}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\r\n");

  return encodeMessage(message);
}

export async function sendWelcomeEmail(payload: EmailPayload) {
  const gmail = await getGmailClient();

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: buildRawEmail(payload),
    },
  });
}

export async function sendTestEmail(to: string, temporaryPassword: string) {
  await sendWelcomeEmail({
    to,
    fullName: "מנהל מערכת Posseable",
    temporaryPassword,
    inviteUrl: getInviteUrl(),
    isTest: true,
  });
}
