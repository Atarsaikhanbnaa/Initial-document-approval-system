"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteDocumentButton({
  documentId,
  title,
}: {
  documentId: string;
  title: string;
}) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function deleteDocument() {
    const ok = window.confirm(
      `"${title}" бичиг баримтыг устгах уу?\n\n` +
        "Файл, version history, санал болон үйлдлийн түүх хамт устах болно."
    );

    if (!ok) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Устгах үед алдаа гарлаа."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Сервертэй холбогдох үед алдаа гарлаа."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="delete-document-btn"
      onClick={deleteDocument}
      disabled={loading}
    >
      {loading
        ? "Устгаж байна..."
        : "🗑 Устгах"}
    </button>
  );
}