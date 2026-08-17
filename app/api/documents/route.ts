import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import User from "@/models/User";
import Document from "@/models/Document";
import DocumentLog from "@/models/DocumentLog";
import DocumentVersion from "@/models/DocumentVersion";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const form = await req.formData();

    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const reviewerId = String(form.get("reviewerId") || "");
    const file = form.get("file");

    if (!title || !reviewerId || !(file instanceof File)) {
      return NextResponse.json({ error: "Мэдээлэл дутуу байна." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (![".doc", ".docx"].includes(ext)) {
      return NextResponse.json({ error: "Зөвхөн .doc эсвэл .docx файл оруулна." }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Файлын хэмжээ 20MB-аас их байна." }, { status: 400 });
    }

    await connectDB();

    const reviewer = await User.findById(reviewerId);
    if (!reviewer || !reviewer.isActive) {
      return NextResponse.json({ error: "Хянагч олдсонгүй." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), bytes);

    const doc = await Document.create({
      title,
      description,
      originalFileName: file.name,
      currentFileName: safeName,
      currentFileUrl: `/api/files/${safeName}`,
      uploadedBy: session.userId,
      uploadedByName: session.name,
      currentReviewer: reviewer._id,
      currentReviewerName: reviewer.name,
      status: "UNDER_REVIEW",
      version: 1,
    });

    await DocumentVersion.create({
      documentId: doc._id,
      version: 1,
      fileName: safeName,
      fileUrl: `/api/files/${safeName}`,
      uploadedBy: session.userId,
      uploadedByName: session.name,
      position: session.position,
      note: "Анхны хувилбар",
    });

    await DocumentLog.create({
      documentId: doc._id,
      userId: session.userId,
      userName: session.name,
      department: session.department,
      position: session.position,
      action: "UPLOADED",
      description: `${file.name} файлыг хяналтанд илгээсэн`,
    });

    return NextResponse.json({ ok: true, documentId: doc._id.toString() });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Нэвтрээгүй байна." }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "Файл хадгалахад алдаа гарлаа." }, { status: 500 });
  }
}
