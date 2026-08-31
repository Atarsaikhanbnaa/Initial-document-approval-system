import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";

import Document from "@/models/Document";
import DocumentVersion from "@/models/DocumentVersion";
import DocumentLog from "@/models/DocumentLog";
import Comment from "@/models/Comment";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await requireSession();

    const { id } = await context.params;

    await connectDB();

    const doc = await Document.findById(id);

    if (!doc) {
      return NextResponse.json(
        {
          error: "Бичиг баримт олдсонгүй.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      ADMIN бүх файлыг устгаж болно.
      Энгийн хэрэглэгч зөвхөн өөрийн оруулсан файлыг устгана.
    */
    const isAdmin = session.role === "ADMIN";

    const isOwner =
      doc.uploadedBy?.toString() === session.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        {
          error:
            "Та зөвхөн өөрийн оруулсан бичиг баримтыг устгах боломжтой.",
        },
        {
          status: 403,
        }
      );
    }

    /*
      Бүх version-ийг олно.
    */
    const versions =
      await DocumentVersion.find({
        documentId: id,
      }).lean();

    /*
      uploads folder доторх файлуудыг устгана.
    */
    const fileNames = new Set<string>();

    if (doc.currentFileName) {
      fileNames.add(
        path.basename(doc.currentFileName)
      );
    }

    for (const version of versions as any[]) {
      if (version.fileName) {
        fileNames.add(
          path.basename(version.fileName)
        );
      }
    }

    for (const fileName of fileNames) {
      try {
        const filePath = path.join(
          process.cwd(),
          "uploads",
          fileName
        );

        await unlink(filePath);
      } catch (error: any) {
        /*
          Файл өмнө нь байхгүй болсон бол
          document устгах ажиллагааг зогсоохгүй.
        */
        if (error?.code !== "ENOENT") {
          console.error(
            "FILE DELETE ERROR:",
            fileName,
            error
          );
        }
      }
    }

    /*
      Холбоотой MongoDB мэдээллүүдийг цэвэрлэнэ.
    */
    await Promise.all([
      DocumentVersion.deleteMany({
        documentId: id,
      }),

      DocumentLog.deleteMany({
        documentId: id,
      }),

      Comment.deleteMany({
        documentId: id,
      }),
    ]);

    await Document.findByIdAndDelete(id);

    return NextResponse.json({
      ok: true,
      message:
        "Бичиг баримт амжилттай устгагдлаа.",
    });
  } catch (error: any) {
    console.error(
      "DOCUMENT DELETE ERROR:",
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
          "Бичиг баримт устгах үед алдаа гарлаа.",
      },
      {
        status: 500,
      }
    );
  }
}