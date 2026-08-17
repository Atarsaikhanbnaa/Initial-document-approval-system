import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";
import DocumentLog from "@/models/DocumentLog";
import DocumentVersion from "@/models/DocumentVersion";
import Comment from "@/models/Comment";
import Nav from "@/components/Nav";
import DocumentActions from "@/components/DocumentActions";

const actionText: Record<string, string> = {
  UPLOADED: "Файл оруулсан",
  VIEWED: "Файл үзсэн",
  DOWNLOADED: "Файл татсан",
  EDITED: "Файл засварласан",
  SUBMITTED: "Хяналтанд илгээсэн",
  REVIEWED: "Хянаж дууссан",
  APPROVED: "Баталсан",
  REJECTED: "Татгалзсан",
  RETURNED: "Засварт буцаасан",
  COMMENTED: "Санал бичсэн",
};

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  await connectDB();

  const doc = await Document.findById(id).lean();
  if (!doc) notFound();

  const allowed =
    session.role === "ADMIN" ||
    session.role === "DIRECTOR" ||
    doc.uploadedBy.toString() === session.userId ||
    doc.currentReviewer?.toString() === session.userId;

  if (!allowed) redirect("/dashboard");

  // Page нээгдэх бүрд VIEWED лог давхардахгүйн тулд API-г client талаас нэг удаа дуудна.
  const logs = await DocumentLog.find({ documentId: id }).sort({ createdAt: -1 }).lean();
  const versions = await DocumentVersion.find({ documentId: id }).sort({ version: -1 }).lean();
  const comments = await Comment.find({ documentId: id }).sort({ createdAt: -1 }).lean();

  return (
    <>
      <Nav name={session.name} position={session.position} />
      <main className="container grid">
        <div className="card">
          <div className="row space">
            <div>
              <h1>{doc.title}</h1>
              <div className="muted">{doc.description}</div>
            </div>
            <span className="badge">{doc.status}</span>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

          <div className="grid grid-2">
            <div>
              <strong>Оруулсан:</strong> {doc.uploadedByName}<br />
              <strong>Хянагч:</strong> {doc.currentReviewerName || "-"}<br />
              <strong>Одоогийн хувилбар:</strong> v{doc.version}
            </div>
            <div>
              <strong>Файл:</strong> {doc.originalFileName}<br />
              <a className="btn secondary" href={`/api/documents/${id}/download`}>
                Word файл татах
              </a>
            </div>
          </div>
        </div>

        <DocumentActions
          documentId={id}
          currentStatus={doc.status}
          isReviewer={
            doc.currentReviewer?.toString() === session.userId ||
            session.role === "DIRECTOR" ||
            session.role === "ADMIN"
          }
        />

        <div className="grid grid-2">
          <div className="card">
            <h2>Version history</h2>
            {versions.map((v: any) => (
              <div key={v._id.toString()} style={{ marginBottom: 14 }}>
                <strong>v{v.version} — {v.uploadedByName}</strong>
                <div className="muted">{v.position}</div>
                <div>{v.note}</div>
                <a href={`/api/documents/${id}/versions/${v._id}/download`}>Файл татах</a>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Санал / тайлбар</h2>
            {comments.length === 0 && <div className="muted">Санал байхгүй.</div>}
            {comments.map((c: any) => (
              <div key={c._id.toString()} style={{ marginBottom: 14 }}>
                <strong>{c.userName}</strong> · <span className="muted">{c.position}</span>
                <div>{c.text}</div>
                <div className="muted">{new Date(c.createdAt).toLocaleString("mn-MN")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Үйлдлийн түүх</h2>
          <div className="timeline">
            {logs.map((log: any) => (
              <div className="timeline-item" key={log._id.toString()}>
                <strong>{log.userName}</strong>
                <div>{log.position} · {log.department}</div>
                <div>{actionText[log.action] || log.action}</div>
                {log.description && <div className="muted">{log.description}</div>}
                <div className="muted">{new Date(log.createdAt).toLocaleString("mn-MN")}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
