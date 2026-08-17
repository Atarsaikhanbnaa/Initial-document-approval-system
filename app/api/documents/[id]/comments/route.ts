import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import Comment from "@/models/Comment";
import DocumentLog from "@/models/DocumentLog";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const { text } = await req.json();

    if (!String(text || "").trim()) {
      return NextResponse.json({ error: "Санал хоосон байна." }, { status: 400 });
    }

    await connectDB();

    await Comment.create({
      documentId: id,
      userId: session.userId,
      userName: session.name,
      position: session.position,
      text: String(text).trim(),
    });

    await DocumentLog.create({
      documentId: id,
      userId: session.userId,
      userName: session.name,
      department: session.department,
      position: session.position,
      action: "COMMENTED",
      description: String(text).trim(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Санал хадгалахад алдаа гарлаа." }, { status: 500 });
  }
}
