import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Document from "@/models/Document";
import DocumentVersion from "@/models/DocumentVersion";
import DocumentLog from "@/models/DocumentLog";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const form = await req.formData();
    const file = form.get("file");
    const note = String(form.get("note") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл сонгоно уу." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (![".doc", ".docx"].includes(ext)) {
      return NextResponse.json({ error: "Word файл оруулна уу." }, { status: 400 });
    }

    await connectDB();
    const doc = await Document.findById(id);
    if (!doc) return NextResponse.json({ error: "Бичиг баримт олдсонгүй." }, { status: 404 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), bytes);

    const newVersion = doc.version + 1;

    await DocumentVersion.create({
      documentId: id,
      version: newVersion,
      fileName,
      fileUrl: `/api/files/${fileName}`,
      uploadedBy: session.userId,
      uploadedByName: session.name,
      position: session.position,
      note,
    });

    doc.version = newVersion;
    doc.currentFileName = fileName;
    doc.currentFileUrl = `/api/files/${fileName}`;
    doc.originalFileName = file.name;
    doc.status = "UNDER_REVIEW";
    await doc.save();

    await DocumentLog.create({
      documentId: id,
      userId: session.userId,
      userName: session.name,
      department: session.department,
      position: session.position,
      action: "EDITED",
      description: `v${newVersion} хувилбар оруулсан${note ? ` — ${note}` : ""}`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Version хадгалахад алдаа гарлаа." }, { status: 500 });
  }
}
