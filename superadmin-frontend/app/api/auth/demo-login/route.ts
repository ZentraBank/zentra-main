import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", request.url), 303);
  }

  // Demo-only session. Replace this route with your real backend login.
  const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);

  response.cookies.set("superadmin_session", "demo-superadmin-session", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
