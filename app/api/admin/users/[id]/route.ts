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
          error: "Зөвхөн админ засах эрхтэй.",
        },
        {
          status: 403,
        }
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
        {
          error: "Role буруу байна.",
        },
        {
          status: 400,
        }
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
        {
          error: "Хэрэглэгч олдсонгүй.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ.",
    });
  } catch (error) {
    console.error(
      "USER UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Хэрэглэгч засахад алдаа гарлаа.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================
   DELETE USER
===================================== */

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await requireSession();

    // Зөвхөн ADMIN устгана
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Зөвхөн админ хэрэглэгч устгах эрхтэй.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await context.params;

    await connectDB();

    // Өөрийн account-аа устгахгүй
    if (id === session.userId) {
      return NextResponse.json(
        {
          error:
            "Та өөрийн нэвтэрсэн ADMIN хэрэглэгчийг устгах боломжгүй.",
        },
        {
          status: 400,
        }
      );
    }

    // Хэрэглэгч байгаа эсэх
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          error: "Хэрэглэгч олдсонгүй.",
        },
        {
          status: 404,
        }
      );
    }

    // MongoDB-с бүр мөсөн устгах
    const deletedUser =
      await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        {
          error:
            "Хэрэглэгчийг устгаж чадсангүй.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Хэрэглэгч амжилттай бүр мөсөн устгагдлаа.",
    });
  } catch (error: any) {
    console.error(
      "USER DELETE ERROR:",
      error
    );

    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          error: "Нэвтрээгүй байна.",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Хэрэглэгч устгах үед серверийн алдаа гарлаа.",
      },
      {
        status: 500,
      }
    );
  }
}