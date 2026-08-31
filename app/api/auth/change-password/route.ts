import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Нэвтрээгүй байна." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байна." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Шинэ нууц үг хоорондоо таарахгүй байна." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Шинэ нууц үг хуучин нууц үгтэй ижил байна." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй." },
        { status: 404 }
      );
    }

    const passwordCorrect = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        { error: "Одоогийн нууц үг буруу байна." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    user.passwordHash = passwordHash;
    await user.save();

    return NextResponse.json({
      ok: true,
      message: "Нууц үг амжилттай солигдлоо.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      { error: "Нууц үг солих үед алдаа гарлаа." },
      { status: 500 }
    );
  }
}