import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import User from "@/models/User";

export async function PUT(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await requireSession();

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Зөвхөн админ нууц үг солих эрхтэй." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const password = String(body.password || "").trim();

    if (!password) {
      return NextResponse.json(
        { error: "Нууц үг оруулна уу." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй." },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    user.passwordHash = passwordHash;
    await user.save();

    return NextResponse.json({
      ok: true,
      message: "Нууц үг амжилттай солигдлоо.",
    });

  } catch (error) {
    console.error("PASSWORD CHANGE ERROR:", error);

    return NextResponse.json(
      { error: "Нууц үг солиход серверийн алдаа гарлаа." },
      { status: 500 }
    );
  }
}