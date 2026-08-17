"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  name: string;
  username: string;
  department: string;
  position: string;
  role: string;
  isActive: boolean;
};

export default function UserActions({
  user,
}: {
  user: UserData;
}) {
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: user.name,
    department: user.department,
    position: user.position,
    role: user.role,
  });

  async function updateUser() {
    setMessage("");

    const res = await fetch(
      `/api/admin/users/${user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Алдаа гарлаа.");
      return;
    }

    setEditMode(false);
    router.refresh();
  }

  async function changePassword() {
    const password = prompt(
      `${user.username} хэрэглэгчийн шинэ нууц үгийг оруулна уу:`
    );

    if (!password) return;

    if (password.length < 6) {
      alert("Нууц үг хамгийн багадаа 6 тэмдэгт байна.");
      return;
    }

    const res = await fetch(
      `/api/admin/users/${user.id}/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Нууц үг солиход алдаа гарлаа.");
      return;
    }

    alert("Нууц үг амжилттай солигдлоо.");
  }

  async function toggleActive() {
    const action = user.isActive
      ? "идэвхгүй болгох"
      : "идэвхжүүлэх";

    const ok = confirm(
      `${user.name} хэрэглэгчийг ${action} уу?`
    );

    if (!ok) return;

    const res = await fetch(
      `/api/admin/users/${user.id}/active`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Алдаа гарлаа.");
      return;
    }

    router.refresh();
  }

  if (editMode) {
    return (
      <div className="grid">
        <input
          className="input"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Нэр"
        />

        <input
          className="input"
          value={form.department}
          onChange={(e) =>
            setForm({
              ...form,
              department: e.target.value,
            })
          }
          placeholder="Хэлтэс / Алба"
        />

        <input
          className="input"
          value={form.position}
          onChange={(e) =>
            setForm({
              ...form,
              position: e.target.value,
            })
          }
          placeholder="Албан тушаал"
        />

        <select
          className="select"
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value,
            })
          }
        >
          <option value="EMPLOYEE">Ажилтан</option>
          <option value="REVIEWER">Хянагч</option>
          <option value="DIRECTOR">Захирал</option>
          <option value="ADMIN">Админ</option>
        </select>

        <div className="row">
          <button
            className="btn success"
            onClick={updateUser}
          >
            Хадгалах
          </button>

          <button
            className="btn secondary"
            onClick={() => setEditMode(false)}
          >
            Болих
          </button>
        </div>

        {message && (
          <div className="error">{message}</div>
        )}
      </div>
    );
  }

  return (
    <div className="row">
      <button
        className="btn secondary"
        onClick={() => setEditMode(true)}
      >
        Засах
      </button>

      <button
        className="btn warning"
        onClick={changePassword}
      >
        Нууц үг
      </button>

      <button
        className={
          user.isActive
            ? "btn danger"
            : "btn success"
        }
        onClick={toggleActive}
      >
        {user.isActive
          ? "Идэвхгүй"
          : "Идэвхжүүлэх"}
      </button>
    </div>
  );
}