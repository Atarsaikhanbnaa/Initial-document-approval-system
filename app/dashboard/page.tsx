import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";
import Nav from "@/components/Nav";

const statusText: Record<string, string> = {
  DRAFT: "Ноорог",
  SUBMITTED: "Илгээсэн",
  UNDER_REVIEW: "Хянаж байгаа",
  REVISION: "Засвар шаардлагатай",
  REVIEWED: "Хянасан",
  APPROVED: "Батлагдсан",
  REJECTED: "Татгалзсан",
};

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const query =
    session.role === "ADMIN" || session.role === "DIRECTOR"
      ? {}
      : {
          $or: [
            { uploadedBy: session.userId },
            { currentReviewer: session.userId },
          ],
        };

  const docs = await Document.find(query).sort({ updatedAt: -1 }).lean();

  return (
    <>
      <Nav name={session.name} position={session.position} />
      <main className="container grid">
        <div className="row space">
          <div>
            <h1>Dashboard</h1>
            <div className="muted">{session.department}</div>
          </div>
          <a className="btn" href="/documents/upload">+ Word файл оруулах</a>
        </div>

        <div className="card">
          <h2>Бичиг баримтууд</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Гарчиг</th>
                <th>Оруулсан</th>
                <th>Хянагч</th>
                <th>Статус</th>
                <th>Version</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc: any) => (
                <tr key={doc._id.toString()}>
                  <td>
                    <strong>{doc.title}</strong>
                    <div className="muted">{doc.originalFileName}</div>
                  </td>
                  <td>{doc.uploadedByName}</td>
                  <td>{doc.currentReviewerName || "-"}</td>
                  <td><span className="badge">{statusText[doc.status] || doc.status}</span></td>
                  <td>v{doc.version}</td>
                  <td><a className="btn secondary" href={`/documents/${doc._id}`}>Нээх</a></td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr><td colSpan={6} className="muted">Одоогоор файл байхгүй байна.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
