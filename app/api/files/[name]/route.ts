import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { requireSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ name: string }> }
) {
  try {
    await requireSession();
    const { name } = await context.params;

    const safe = path.basename(name);
    const filePath = path.join(process.cwd(), "uploads", safe);
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safe}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл олдсонгүй." }, { status: 404 });
  }
}
