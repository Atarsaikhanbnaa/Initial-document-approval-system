"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Nav({
  name,
  position,
}: {
  name: string;
  position: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

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
        {/* Зүүн тал */}
        <div className="row" style={{ gap: 14 }}>
          <img
            src="/logo.jpg"
            alt="ББЦТС"
            onClick={() => router.push("/dashboard")}
            style={{
              width: 54,
              height: 54,
              objectFit: "contain",
              cursor: "pointer",
            }}
          />

          <div>
            <div
              style={{
                fontWeight: 800,
                color: "#123A73",
                fontSize: 18,
              }}
            >
              БАРУУН БҮСИЙН ЦАХИЛГААН ТҮГЭЭХ СҮЛЖЭЭ ТӨХК
            </div>

            <div className="muted" style={{ fontSize: 13 }}>
              Бичиг баримтын хяналт, баталгаажуулалтын систем
            </div>
          </div>
        </div>

        {/* Баруун тал */}
        <div className="row" style={{ gap: 12 }}>
          {pathname !== "/dashboard" && (
            <button
              className="btn secondary"
              onClick={() => router.back()}
            >
              ← Буцах
            </button>
          )}

          <div className="avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ fontWeight: 700 }}>{name}</div>
            <div className="muted">{position}</div>
          </div>

          <button className="btn danger" onClick={logout}>
            Гарах
          </button>
        </div>
      </div>
    </nav>
  );
}