"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserForm() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const body = {
      name: data.get("name"),
      username: data.get("username"),
      password: data.get("password"),
      department: data.get("department"),
      position: data.get("position"),
      role: data.get("role"),
    };

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    setBusy(false);

    if (!res.ok) {
      setError(result.error || "Хэрэглэгч нэмэхэд алдаа гарлаа.");
      return;
    }

    setSuccess("Ажилтан амжилттай нэмэгдлээ.");

    form.reset();

    router.refresh();
  }

  return (
    <form className="card grid" onSubmit={submit}>
      <h2>Шинэ ажилтан нэмэх</h2>

      {error && <div className="error">{error}</div>}

      {success && (
        <div className="successbox">
          {success}
        </div>
      )}

      <div className="grid grid-2">

        <div>
          <label className="label">Овог нэр</label>

          <input
            className="input"
            name="name"
            placeholder="Б.Бат"
            required
          />
        </div>

        <div>
          <label className="label">Username</label>

          <input
            className="input"
            name="username"
            placeholder="bat"
            required
          />
        </div>

        <div>
          <label className="label">Нууц үг</label>

          <input
            className="input"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="label">Хэлтэс / Алба</label>

          <input
            className="input"
            name="department"
            placeholder="Мэдээлэл технологийн алба"
            required
          />
        </div>

        <div>
          <label className="label">Албан тушаал</label>

          <input
            className="input"
            name="position"
            placeholder="Мэргэжилтэн"
            required
          />
        </div>

        <div>
          <label className="label">Системийн эрх</label>

          <select
            className="select"
            name="role"
            defaultValue="EMPLOYEE"
          >
            <option value="EMPLOYEE">
              Ажилтан
            </option>

            <option value="REVIEWER">
              Хянагч
            </option>

            <option value="DIRECTOR">
              Захирал
            </option>

            <option value="ADMIN">
              Админ
            </option>
          </select>
        </div>

      </div>

      <button
        className="btn"
        type="submit"
        disabled={busy}
      >
        {busy ? "Хадгалж байна..." : "+ Ажилтан нэмэх"}
      </button>
    </form>
  );
}