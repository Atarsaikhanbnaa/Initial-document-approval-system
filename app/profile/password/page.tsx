"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Шинэ нууц үг хоорондоо таарахгүй байна.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа.");
        return;
      }

      setMessage("Нууц үг амжилттай солигдлоо.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Сервертэй холбогдох үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .password-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f4f7fb;
          padding: 40px 20px;
          font-family: "Segoe UI", Arial, sans-serif;
        }

        .password-card {
          width: 100%;
          max-width: 430px;
          background: #fff;
          border-radius: 18px;
          padding: 32px;
          box-shadow: 0 15px 40px rgba(20, 60, 110, 0.12);
          border: 1px solid #e5eaf1;
        }

        .back-btn {
          border: none;
          background: transparent;
          color: #1d5fa7;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .icon-box {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: #edf4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          margin-bottom: 15px;
        }

        .password-card h1 {
          margin: 0 0 7px;
          color: #163d74;
          font-size: 26px;
        }

        .desc {
          color: #7b8798;
          font-size: 13px;
          margin-bottom: 25px;
        }

        .password-card label {
          display: block;
          margin: 15px 0 7px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .password-card input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid #d8e0ea;
          border-radius: 9px;
          font-size: 14px;
          outline: none;
        }

        .password-card input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.1);
        }

        .submit-btn {
          width: 100%;
          margin-top: 22px;
          padding: 13px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg,#164b8e,#2563eb);
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
        }

        .submit-btn:disabled {
          opacity: .6;
        }

        .error-box {
          margin-top: 15px;
          padding: 11px;
          background: #fff1f2;
          color: #be123c;
          border-radius: 8px;
          font-size: 13px;
        }

        .success-box {
          margin-top: 15px;
          padding: 11px;
          background: #ecfdf5;
          color: #047857;
          border-radius: 8px;
          font-size: 13px;
        }
      `}</style>

      <main className="password-page">
        <div className="password-card">

          <button
            type="button"
            className="back-btn"
            onClick={() => router.back()}
          >
            ← Буцах
          </button>

          <div className="icon-box">🔐</div>

          <h1>Нууц үг солих</h1>

          <div className="desc">
            Өөрийн бүртгэлийн нууц үгийг шинэчилнэ үү.
          </div>

          <form onSubmit={submit}>

            <label>Одоогийн нууц үг</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <label>Шинэ нууц үг</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />

            <label>Шинэ нууц үг давтах</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />

            {error && (
              <div className="error-box">{error}</div>
            )}

            {message && (
              <div className="success-box">{message}</div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Хадгалж байна..." : "Нууц үг солих"}
            </button>

          </form>
        </div>
      </main>
    </>
  );
}