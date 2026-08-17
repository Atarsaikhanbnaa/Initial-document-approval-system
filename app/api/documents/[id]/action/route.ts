import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Document from "@/models/Document";
import DocumentLog from "@/models/DocumentLog";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const { action } = await req.json();

    await connectDB();
    const doc = await Document.findById(id);
    if (!doc) return NextResponse.json({ error: "Бичиг баримт олдсонгүй." }, { status: 404 });

    const isReviewer =
      doc.currentReviewer?.toString() === session.userId ||
      session.role === "DIRECTOR" ||
      session.role === "ADMIN";

    if (!isReviewer) {
      return NextResponse.json({ error: "Энэ үйлдлийг хийх эрхгүй." }, { status: 403 });
    }

    let logAction = "";
    let desc = "";

    if (action === "APPROVE") {
      doc.status = "APPROVED";
      logAction = "APPROVED";
      desc = "Бичиг баримтыг баталсан";
    } else if (action === "REVIEW") {
      doc.status = "REVIEWED";
      logAction = "REVIEWED";
      desc = "Хянаж дууссан";
    } else if (action === "RETURN") {
      doc.status = "REVISION";
      logAction = "RETURNED";
      desc = "Засварт буцаасан";
    } else {
      return NextResponse.json({ error: "Үйлдэл буруу байна." }, { status: 400 });
    }

    await doc.save();

    await DocumentLog.create({
      documentId: id,
      userId: session.userId,
      userName: session.name,
      department: session.department,
      position: session.position,
      action: logAction,
      description: desc,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Үйлдэл хийхэд алдаа гарлаа." }, { status: 500 });
  }
}
