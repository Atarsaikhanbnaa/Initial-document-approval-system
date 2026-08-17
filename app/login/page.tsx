"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const data = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username"),
        password: data.get("password"),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Нэвтрэх үед алдаа гарлаа.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="login-wrap">
      <form className="card login-card grid" onSubmit={submit}>
        <div>
          <h1>Бичиг баримтын систем</h1>
          <div className="muted">Хэрэглэгчийн нэр, нууц үгээр нэвтэрнэ.</div>
        </div>

        {error && <div className="error">{error}</div>}

        <div>
          <label className="label">Хэрэглэгчийн нэр</label>
          <input className="input" name="username" required />
        </div>

        <div>
          <label className="label">Нууц үг</label>
          <input className="input" type="password" name="password" required />
        </div>

        <button className="btn" type="submit">Нэвтрэх</button>
      </form>
    </div>
  );
}
