import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Document from "@/models/Document";
import DocumentLog from "@/models/DocumentLog";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await context.params;

    await connectDB();
    const doc = await Document.findById(id);
    if (!doc) return NextResponse.json({ error: "Файл олдсонгүй." }, { status: 404 });

    const filePath = path.join(process.cwd(), "uploads", path.basename(doc.currentFileName));
    const file = await readFile(filePath);

    await DocumentLog.create({
      documentId: id,
      userId: session.userId,
      userName: session.name,
      department: session.department,
      position: session.position,
      action: "DOWNLOADED",
      description: `v${doc.version} файлыг татсан`,
    });

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.originalFileName)}`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл татахад алдаа гарлаа." }, { status: 500 });
  }
}
