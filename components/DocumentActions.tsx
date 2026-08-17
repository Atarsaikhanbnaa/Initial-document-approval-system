"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentActions({
  documentId,
  currentStatus,
  isReviewer,
}: {
  documentId: string;
  currentStatus: string;
  isReviewer: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/documents/${documentId}/view`, { method: "POST" });
  }, [documentId]);

  async function action(type: string) {
    setMessage("");
    const res = await fetch(`/api/documents/${documentId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || "Алдаа гарлаа.");
    router.refresh();
  }

  async function uploadVersion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/documents/${documentId}/versions`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || "Алдаа гарлаа.");
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  async function comment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const text = String(fd.get("text") || "");
    const res = await fetch(`/api/documents/${documentId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || "Алдаа гарлаа.");
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="grid grid-2">
      <div className="card grid">
        <h2>Засварласан файл оруулах</h2>
        <form className="grid" onSubmit={uploadVersion}>
          <input className="input" type="file" name="file" accept=".doc,.docx" required />
          <textarea className="textarea" name="note" placeholder="Ямар засвар хийснээ бичнэ үү" />
          <button className="btn warning">Шинэ version оруулах</button>
        </form>
      </div>

      <div className="card grid">
        <h2>Хяналтын үйлдэл</h2>
        <div className="muted">Одоогийн статус: {currentStatus}</div>

        {isReviewer && (
          <div className="row">
            <button className="btn success" onClick={() => action("APPROVE")}>Батлах</button>
            <button className="btn" onClick={() => action("REVIEW")}>Хянасан</button>
            <button className="btn danger" onClick={() => action("RETURN")}>Засварт буцаах</button>
          </div>
        )}

        <form className="grid" onSubmit={comment}>
          <textarea className="textarea" name="text" placeholder="Санал, тайлбар..." required />
          <button className="btn secondary">Санал бичих</button>
        </form>

        {message && <div className="error">{message}</div>}
      </div>
    </div>
  );
}
