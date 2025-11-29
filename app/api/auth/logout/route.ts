import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("session");

  return NextResponse.json({
    success: true,
    redirect: "/login",
    message: "Logged out successfully",
  });
}

export async function GET() {
  return POST();
}

