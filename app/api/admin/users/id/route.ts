import { NextResponse } from "next/server";
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
        { error: "Зөвхөн админ засах эрхтэй." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const {
      name,
      department,
      position,
      role,
    } = await req.json();

    const allowedRoles = [
      "EMPLOYEE",
      "REVIEWER",
      "DIRECTOR",
      "ADMIN",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Role буруу байна." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        department: String(department).trim(),
        position: String(position).trim(),
        role,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Хэрэглэгч засахад алдаа гарлаа." },
      { status: 500 }
    );
  }
}