"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Reviewer = {
  id: string;
  name: string;
  position: string;
  department: string;
};

export default function UploadForm({ reviewers }: { reviewers: Reviewer[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Файл оруулахад алдаа гарлаа.");
      return;
    }

    router.push(`/documents/${data.documentId}`);
    router.refresh();
  }

  return (
    <form className="card grid" onSubmit={submit}>
      <div>
        <h1>Word файл оруулах</h1>
        <div className="muted">Зөвхөн .doc болон .docx файл.</div>
      </div>

      {error && <div className="error">{error}</div>}

      <div>
        <label className="label">Бичиг баримтын гарчиг</label>
        <input className="input" name="title" required />
      </div>

      <div>
        <label className="label">Тайлбар</label>
        <textarea className="textarea" name="description" />
      </div>

      <div>
        <label className="label">Хянах албан тушаалтан</label>
        <select className="select" name="reviewerId" required>
          <option value="">Сонгоно уу</option>
          {reviewers.map((r) => (
            <option value={r.id} key={r.id}>
              {r.name} — {r.position} — {r.department}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Word файл</label>
        <input className="input" type="file" name="file" accept=".doc,.docx" required />
      </div>

      <button className="btn" disabled={busy}>
        {busy ? "Оруулж байна..." : "Хяналтанд илгээх"}
      </button>
    </form>
  );
}
