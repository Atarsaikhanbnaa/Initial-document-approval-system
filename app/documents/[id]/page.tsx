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

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  await connectDB();

  const doc = await Document.findById(id).lean();

  if (!doc) {
    notFound();
  }

  const allowed =
    session.role === "ADMIN" ||
    session.role === "DIRECTOR" ||
    doc.uploadedBy.toString() === session.userId ||
    doc.currentReviewer?.toString() === session.userId;

  if (!allowed) {
    redirect("/dashboard");
  }

  const logs = await DocumentLog.find({
    documentId: id,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  const versions = await DocumentVersion.find({
    documentId: id,
  })
    .sort({
      version: -1,
    })
    .lean();

  const comments = await Comment.find({
    documentId: id,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  return (
    <>
      <Nav
        name={session.name}
        position={session.position}
      />

      <main className="container grid">

        {/* ================================
            DOCUMENT HEADER
        ================================= */}

        <div className="card">

          <div className="row space">

            <div>
              <h1
                style={{
                  marginBottom: "8px",
                }}
              >
                {doc.title}
              </h1>

              <div className="muted">
                {doc.description}
              </div>
            </div>

            <span className="badge">
              {doc.status}
            </span>

          </div>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #e5e7eb",
              margin: "22px 0",
            }}
          />

          {/* DOCUMENT INFO */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1fr) minmax(260px, 1.5fr) auto",
              gap: "32px",
              alignItems: "center",
              width: "100%",
            }}
          >

            {/* LEFT */}

            <div
              style={{
                lineHeight: 1.7,
              }}
            >
              <div>
                <strong>
                  Оруулсан:
                </strong>{" "}
                {doc.uploadedByName}
              </div>

              <div>
                <strong>
                  Хянагч:
                </strong>{" "}
                {doc.currentReviewerName || "-"}
              </div>

              <div>
                <strong>
                  Одоогийн хувилбар:
                </strong>{" "}
                v{doc.version}
              </div>
            </div>

            {/* CENTER - FILE NAME */}

            <div
              style={{
                minWidth: 0,
                textAlign: "center",
                padding: "0 10px",
              }}
            >
              <div
                className="muted"
                style={{
                  marginBottom: "6px",
                }}
              >
                Файлын нэр
              </div>

              <div
                style={{
                  fontWeight: 600,
                  color: "#334155",
                  lineHeight: 1.5,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {doc.originalFileName}
              </div>
            </div>

            {/* RIGHT - DOWNLOAD */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <a
                className="btn secondary"
                href={`/api/documents/${id}/download`}
                style={{
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "160px",
                }}
              >
                Word файл татах
              </a>
            </div>

          </div>

        </div>

        {/* ================================
            DOCUMENT ACTIONS
        ================================= */}

        <DocumentActions
          documentId={id}
          currentStatus={doc.status}
          isReviewer={
            doc.currentReviewer?.toString() ===
              session.userId ||
            session.role === "DIRECTOR" ||
            session.role === "ADMIN"
          }
        />

        {/* ================================
            VERSION + COMMENTS
        ================================= */}

        <div className="grid grid-2">

          {/* VERSION HISTORY */}

          <div className="card">

            <h2>
              Version history
            </h2>

            {versions.length === 0 && (
              <div className="muted">
                Хувилбарын түүх байхгүй.
              </div>
            )}

            {versions.map((v: any) => (
              <div
                key={v._id.toString()}
                style={{
                  marginBottom: "18px",
                  paddingBottom: "16px",
                  borderBottom:
                    "1px solid #edf2f7",
                }}
              >
                <strong>
                  v{v.version} —{" "}
                  {v.uploadedByName}
                </strong>

                <div className="muted">
                  {v.position}
                </div>

                {v.note && (
                  <div
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    {v.note}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  <a
                    href={`/api/documents/${id}/versions/${v._id}/download`}
                    style={{
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    Файл татах
                  </a>
                </div>
              </div>
            ))}

          </div>

          {/* COMMENTS */}

          <div className="card">

            <h2>
              Санал / тайлбар
            </h2>

            {comments.length === 0 && (
              <div className="muted">
                Санал байхгүй.
              </div>
            )}

            {comments.map((c: any) => (
              <div
                key={c._id.toString()}
                style={{
                  marginBottom: "18px",
                  paddingBottom: "16px",
                  borderBottom:
                    "1px solid #edf2f7",
                }}
              >
                <div>
                  <strong>
                    {c.userName}
                  </strong>

                  {" · "}

                  <span className="muted">
                    {c.position}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  {c.text}
                </div>

                <div
                  className="muted"
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {new Date(
                    c.createdAt
                  ).toLocaleString("mn-MN")}
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* ================================
            AUDIT LOG
        ================================= */}

        <div className="card">

          <h2>
            Үйлдлийн түүх
          </h2>

          {logs.length === 0 && (
            <div className="muted">
              Үйлдлийн түүх байхгүй.
            </div>
          )}

          <div className="timeline">

            {logs.map((log: any) => (
              <div
                className="timeline-item"
                key={log._id.toString()}
              >
                <strong>
                  {log.userName}
                </strong>

                <div>
                  {log.position} ·{" "}
                  {log.department}
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    fontWeight: 600,
                  }}
                >
                  {actionText[log.action] ||
                    log.action}
                </div>

                {log.description && (
                  <div
                    className="muted"
                    style={{
                      marginTop: "3px",
                    }}
                  >
                    {log.description}
                  </div>
                )}

                <div
                  className="muted"
                  style={{
                    marginTop: "3px",
                  }}
                >
                  {new Date(
                    log.createdAt
                  ).toLocaleString("mn-MN")}
                </div>

              </div>
            ))}

          </div>

        </div>

      </main>
    </>
  );
}