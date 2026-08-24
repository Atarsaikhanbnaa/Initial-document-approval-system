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
    fetch(`/api/documents/${documentId}/view`, {
      method: "POST",
    });
  }, [documentId]);

  async function action(type: string) {
    setMessage("");

    try {
      const res = await fetch(
        `/api/documents/${documentId}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: type,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Үйлдэл хийхэд алдаа гарлаа."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Сервертэй холбогдоход алдаа гарлаа.");
    }
  }

  async function uploadVersion(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);

    setMessage("");

    try {
      const res = await fetch(
        `/api/documents/${documentId}/versions`,
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error ||
            "Шинэ хувилбар оруулахад алдаа гарлаа."
        );
        return;
      }

      form.reset();

      setMessage(
        "Засварласан файл амжилттай орууллаа."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setMessage(
        "Файл оруулах үед серверийн алдаа гарлаа."
      );
    }
  }

  async function comment(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const form = e.currentTarget;

    const fd = new FormData(form);

    const text = String(
      fd.get("text") || ""
    ).trim();

    if (!text) {
      setMessage(
        "Санал, тайлбар оруулна уу."
      );
      return;
    }

    setMessage("");

    try {
      const res = await fetch(
        `/api/documents/${documentId}/comments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error ||
            "Санал хадгалахад алдаа гарлаа."
        );
        return;
      }

      form.reset();

      setMessage(
        "Санал, тайлбар амжилттай хадгалагдлаа."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setMessage(
        "Санал илгээх үед серверийн алдаа гарлаа."
      );
    }
  }

  return (
    <div className="grid grid-2">

      {/* ЗАСВАРЛАСАН ФАЙЛ */}
      <div className="card grid">

        <h2>Засварласан файл оруулах</h2>

        <form
          className="grid"
          onSubmit={uploadVersion}
        >

          <div>
            <label className="label">
              Word файл
            </label>

            <input
              className="input"
              type="file"
              name="file"
              accept=".doc,.docx"
              required
            />
          </div>

          <div>
            <label className="label">
              Засварын тайлбар
            </label>

            <textarea
              className="textarea"
              name="note"
              placeholder="Ямар засвар хийснээ бичнэ үү..."
            />
          </div>

          <button
            className="btn warning"
            type="submit"
          >
            Шинэ version оруулах
          </button>

        </form>

      </div>

      {/* ХЯНАЛТ */}
      <div className="card grid">

        <h2>Хяналтын үйлдэл</h2>

        <div className="muted">
          Одоогийн статус:{" "}
          <strong>
            {currentStatus}
          </strong>
        </div>

        {isReviewer && (
          <div className="row">

            <button
              className="btn success"
              type="button"
              onClick={() =>
                action("APPROVE")
              }
            >
              Батлах
            </button>

            <button
              className="btn"
              type="button"
              onClick={() =>
                action("REVIEW")
              }
            >
              Хянасан
            </button>

            <button
              className="btn danger"
              type="button"
              onClick={() =>
                action("RETURN")
              }
            >
              Засварт буцаах
            </button>

          </div>
        )}

        <form
          className="grid"
          onSubmit={comment}
        >

          <div>
            <label className="label">
              Санал / тайлбар
            </label>

            <textarea
              className="textarea"
              name="text"
              placeholder="Санал, тайлбар..."
              required
            />
          </div>

          <button
            className="btn secondary"
            type="submit"
          >
            Санал бичих
          </button>

        </form>

        {message && (
          <div
            className={
              message.includes("амжилттай")
                ? "successbox"
                : "error"
            }
          >
            {message}
          </div>
        )}

      </div>

    </div>
  );
}