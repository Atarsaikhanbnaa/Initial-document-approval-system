import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import DocumentVersion from "@/models/DocumentVersion";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    await requireSession();
    const { id, versionId } = await context.params;
    await connectDB();

    const version = await DocumentVersion.findOne({
      _id: versionId,
      documentId: id,
    });

    if (!version) {
      return NextResponse.json({ error: "Version олдсонгүй." }, { status: 404 });
    }

    const file = await readFile(
      path.join(process.cwd(), "uploads", path.basename(version.fileName))
    );

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${version.fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Татахад алдаа гарлаа." }, { status: 500 });
  }
}
