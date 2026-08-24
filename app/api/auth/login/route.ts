import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const username = String(
      formData.get("username") || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      formData.get("password") || ""
    );

    if (!username || !password) {
      return NextResponse.redirect(
        new URL("/login?error=missing", req.url)
      );
    }

    await connectDB();

    const user = await User.findOne({
      username,
      isActive: true,
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=user", req.url)
      );
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordCorrect) {
      return NextResponse.redirect(
        new URL("/login?error=password", req.url)
      );
    }

    const token = await createToken({
      userId: user._id.toString(),
      name: user.name,
      username: user.username,
      department: user.department || "",
      position: user.position || "",
      role: user.role,
    });

    const response = NextResponse.redirect(
      new URL("/dashboard", req.url)
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.redirect(
      new URL("/login?error=server", req.url)
    );
  }
}