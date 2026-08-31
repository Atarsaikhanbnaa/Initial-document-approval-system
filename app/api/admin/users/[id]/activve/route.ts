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
        {
          error:
            "Зөвхөн админ төлөв өөрчлөх эрхтэй.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const { isActive } = await req.json();

    await connectDB();

    const user =
      await User.findByIdAndUpdate(
        id,
        {
          isActive: Boolean(isActive),
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
      {
        error:
          "Хэрэглэгчийн төлөв өөрчлөхөд алдаа гарлаа.",
      },
      { status: 500 }
    );
  }
}