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

    await connectDB();
    const doc = await Document.findById(id);
    if (!doc) return NextResponse.json({ error: "Файл олдсонгүй." }, { status: 404 });

    const since = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await DocumentLog.findOne({
      documentId: id,
      userId: session.userId,
      action: "VIEWED",
      createdAt: { $gte: since },
    });

    if (!recent) {
      await DocumentLog.create({
        documentId: id,
        userId: session.userId,
        userName: session.name,
        department: session.department,
        position: session.position,
        action: "VIEWED",
        description: "Бичиг баримтын дэлгэрэнгүйг нээсэн",
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
