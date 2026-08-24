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

const statusClass: Record<string, string> = {
  DRAFT: "status-gray",
  SUBMITTED: "status-blue",
  UNDER_REVIEW: "status-orange",
  REVISION: "status-red",
  REVIEWED: "status-purple",
  APPROVED: "status-green",
  REJECTED: "status-red",
};

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  const query =
    session.role === "ADMIN" ||
    session.role === "DIRECTOR"
      ? {}
      : {
          $or: [
            { uploadedBy: session.userId },
            { currentReviewer: session.userId },
          ],
        };

  const docs = await Document.find(query)
    .sort({
      updatedAt: -1,
    })
    .lean();

  const total = docs.length;

  const reviewing = docs.filter(
    (doc: any) =>
      doc.status === "UNDER_REVIEW" ||
      doc.status === "SUBMITTED"
  ).length;

  const revision = docs.filter(
    (doc: any) =>
      doc.status === "REVISION"
  ).length;

  const approved = docs.filter(
    (doc: any) =>
      doc.status === "APPROVED"
  ).length;

  return (
    <>
      <Nav
        name={session.name}
        position={session.position}
      />

      <main className="container dashboard-page">

        {/* WELCOME */}

        <section className="dashboard-welcome">

          <div>
            <div className="dashboard-label">
              БИЧИГ БАРИМТЫН ХЯНАЛТ
            </div>

            <h1>
              Сайн байна уу, {session.name}
            </h1>

            <p>
              Таны хариуцсан бичиг баримт,
              хяналтын явц болон сүүлийн
              өөрчлөлтүүдийг эндээс харна.
            </p>
          </div>

          <div className="dashboard-actions">

            <a
              href="/documents/upload"
              className="dashboard-primary-btn"
            >
              + Шинэ файл оруулах
            </a>

            {session.role === "ADMIN" && (
              <a
                href="/admin/users"
                className="dashboard-secondary-btn"
              >
                Хэрэглэгч удирдах
              </a>
            )}

          </div>

        </section>

        {/* STATISTICS */}

        <section className="dashboard-stats">

          <div className="stat-card stat-total">
            <div className="stat-icon">
              📄
            </div>

            <div>
              <div className="stat-title">
                Нийт бичиг баримт
              </div>

              <div className="stat-number">
                {total}
              </div>

              <div className="stat-caption">
                Системд бүртгэлтэй
              </div>
            </div>
          </div>

          <div className="stat-card stat-review">
            <div className="stat-icon">
              🔎
            </div>

            <div>
              <div className="stat-title">
                Хяналтанд
              </div>

              <div className="stat-number">
                {reviewing}
              </div>

              <div className="stat-caption">
                Хянагдаж байгаа
              </div>
            </div>
          </div>

          <div className="stat-card stat-revision">
            <div className="stat-icon">
              ✏️
            </div>

            <div>
              <div className="stat-title">
                Засварт
              </div>

              <div className="stat-number">
                {revision}
              </div>

              <div className="stat-caption">
                Буцаагдсан
              </div>
            </div>
          </div>

          <div className="stat-card stat-approved">
            <div className="stat-icon">
              ✓
            </div>

            <div>
              <div className="stat-title">
                Батлагдсан
              </div>

              <div className="stat-number">
                {approved}
              </div>

              <div className="stat-caption">
                Амжилттай баталсан
              </div>
            </div>
          </div>

        </section>

        {/* MAIN GRID */}

        <section className="dashboard-content">

          {/* DOCUMENT TABLE */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Сүүлийн бичиг баримтууд
                </h2>

                <p>
                  Хамгийн сүүлд шинэчлэгдсэн
                  бичиг баримтууд.
                </p>
              </div>

              <a
                href="/documents/upload"
                className="small-action-link"
              >
                Файл оруулах →
              </a>

            </div>

            <div className="dashboard-table-wrap">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>
                      Бичиг баримт
                    </th>

                    <th>
                      Оруулсан
                    </th>

                    <th>
                      Хянагч
                    </th>

                    <th>
                      Статус
                    </th>

                    <th>
                      Version
                    </th>

                    <th></th>
                  </tr>
                </thead>

                <tbody>

                  {docs
                    .slice(0, 10)
                    .map((doc: any) => (

                      <tr
                        key={doc._id.toString()}
                      >

                        <td>

                          <div className="document-cell">

                            <div className="document-icon">
                              W
                            </div>

                            <div>
                              <strong>
                                {doc.title}
                              </strong>

                              <span>
                                {doc.originalFileName}
                              </span>
                            </div>

                          </div>

                        </td>

                        <td>
                          {doc.uploadedByName}
                        </td>

                        <td>
                          {doc.currentReviewerName ||
                            "-"}
                        </td>

                        <td>

                          <span
                            className={`dashboard-status ${
                              statusClass[
                                doc.status
                              ] ||
                              "status-gray"
                            }`}
                          >
                            {statusText[
                              doc.status
                            ] ||
                              doc.status}
                          </span>

                        </td>

                        <td>
                          <strong>
                            v{doc.version}
                          </strong>
                        </td>

                        <td>
                          <a
                            className="view-document-btn"
                            href={`/documents/${doc._id}`}
                          >
                            Нээх
                          </a>
                        </td>

                      </tr>
                    ))}

                  {docs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="dashboard-empty"
                      >
                        Одоогоор бичиг баримт
                        байхгүй байна.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* SIDE PANEL */}

          <aside className="dashboard-side-panel">

            <div className="side-card">

              <div className="side-card-icon">
                👤
              </div>

              <h3>
                Миний мэдээлэл
              </h3>

              <div className="profile-row">
                <span>
                  Нэр
                </span>

                <strong>
                  {session.name}
                </strong>
              </div>

              <div className="profile-row">
                <span>
                  Албан тушаал
                </span>

                <strong>
                  {session.position}
                </strong>
              </div>

              <div className="profile-row">
                <span>
                  Хэлтэс / Алба
                </span>

                <strong>
                  {session.department}
                </strong>
              </div>

              <div className="profile-row">
                <span>
                  Системийн эрх
                </span>

                <strong>
                  {session.role}
                </strong>
              </div>

            </div>

            <div className="side-card quick-actions">

              <h3>
                Хурдан үйлдэл
              </h3>

              <a href="/documents/upload">
                <span>
                  ＋
                </span>

                Шинэ бичиг баримт
              </a>

              {session.role === "ADMIN" && (
                <a href="/admin/users">
                  <span>
                    👥
                  </span>

                  Ажилтан нэмэх
                </a>
              )}

            </div>

          </aside>

        </section>

      </main>
    </>
  );
}