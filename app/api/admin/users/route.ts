import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await requireSession();

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Зөвхөн админ хэрэглэгч нэмэх эрхтэй." },
        { status: 403 }
      );
    }

    const {
      name,
      username,
      password,
      department,
      position,
      role,
    } = await req.json();

    if (
      !name ||
      !username ||
      !password ||
      !department ||
      !position ||
      !role
    ) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна." },
        { status: 400 }
      );
    }

    const allowedRoles = [
      "EMPLOYEE",
      "REVIEWER",
      "DIRECTOR",
      "ADMIN",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Системийн эрх буруу байна." },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanUsername = String(username)
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      username: cleanUsername,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Энэ username бүртгэлтэй байна." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(
      String(password),
      12
    );

    const user = await User.create({
      name: String(name).trim(),
      username: cleanUsername,
      passwordHash,
      department: String(department).trim(),
      position: String(position).trim(),
      role,
      isActive: true,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        department: user.department,
        position: user.position,
        role: user.role,
      },
    });

  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна." },
        { status: 401 }
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Хэрэглэгч хадгалахад алдаа гарлаа." },
      { status: 500 }
    );
  }
}