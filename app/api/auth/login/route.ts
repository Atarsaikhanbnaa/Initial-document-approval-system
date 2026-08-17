import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    await connectDB();
    const user = await User.findOne({
      username: String(username || "").toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password || "", user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });
    }

    const token = await createToken({
      userId: user._id.toString(),
      name: user.name,
      username: user.username,
      department: user.department,
      position: user.position,
      role: user.role,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Серверийн алдаа." }, { status: 500 });
  }
}
