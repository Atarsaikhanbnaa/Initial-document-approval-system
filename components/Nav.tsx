"use client";

import { useRouter } from "next/navigation";

export default function Nav({
  name,
  position,
}: {
  name: string;
  position: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* Системийн нэр + хэрэглэгч */}
        <div>
          <strong>Бичиг баримтын хяналт</strong>

          <div
            style={{
              fontSize: 12,
              opacity: 0.8,
              marginTop: 3,
            }}
          >
            {name} · {position}
          </div>
        </div>

        {/* Цэс */}
        <div className="row">

          <a href="/dashboard">
            Dashboard
          </a>

          <a href="/documents/upload">
            Файл оруулах
          </a>

          <a href="/admin/users">
            Ажилтан
          </a>

          <button
            className="btn secondary"
            onClick={logout}
          >
            Гарах
          </button>

        </div>

      </div>
    </nav>
  );
}