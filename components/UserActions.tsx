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
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: user.name,
    department: user.department,
    position: user.position,
    role: user.role,
  });

  async function updateUser() {
    setMessage("");

    try {
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
        setMessage(
          data.error || "Алдаа гарлаа."
        );
        return;
      }

      setEditMode(false);
      router.refresh();
    } catch (error) {
      console.error(
        "UPDATE USER ERROR:",
        error
      );

      setMessage(
        "Сервертэй холбогдох үед алдаа гарлаа."
      );
    }
  }

  async function changePassword() {
    const password = prompt(
      `${user.username} хэрэглэгчийн шинэ нууц үгийг оруулна уу:`
    );

    if (!password) {
      return;
    }

    if (password.length < 6) {
      alert(
        "Нууц үг хамгийн багадаа 6 тэмдэгт байна."
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/users/${user.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
            "Нууц үг солиход алдаа гарлаа."
        );
        return;
      }

      alert(
        "Нууц үг амжилттай солигдлоо."
      );
    } catch (error) {
      console.error(
        "PASSWORD ERROR:",
        error
      );

      alert(
        "Сервертэй холбогдох үед алдаа гарлаа."
      );
    }
  }

  async function toggleActive() {
    const action = user.isActive
      ? "идэвхгүй болгох"
      : "идэвхжүүлэх";

    const ok = confirm(
      `${user.name} хэрэглэгчийг ${action} уу?`
    );

    if (!ok) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/users/${user.id}/active`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isActive: !user.isActive,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error || "Алдаа гарлаа."
        );
        return;
      }

      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(
        "ACTIVE USER ERROR:",
        error
      );

      alert(
        "Сервертэй холбогдох үед алдаа гарлаа."
      );
    }
  }

async function deleteUser() {
  const ok = window.confirm(
    `"${user.name}" хэрэглэгчийг бүр мөсөн устгах уу?\n\nЭнэ үйлдлийг буцаах боломжгүй.`
  );

  if (!ok) return;

  const confirmUsername = window.prompt(
    `Баталгаажуулахын тулд "${user.username}" гэж бичнэ үү:`
  );

  if (confirmUsername !== user.username) {
    window.alert("Username таарахгүй байна.");
    return;
  }

  try {
    const res = await fetch(
      `/api/admin/users/${user.id}`,
      {
        method: "DELETE",
        cache: "no-store",
      }
    );

    // JSON гэж шууд parse хийхгүй
    const responseText = await res.text();

    console.log(
      "DELETE STATUS:",
      res.status
    );

    console.log(
      "DELETE RESPONSE:",
      responseText
    );

    let data: any = {};

    // JSON мөн эсэхийг шалгаад parse хийнэ
    try {
      if (
        responseText.trim().startsWith("{") ||
        responseText.trim().startsWith("[")
      ) {
        data = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error(
        "JSON PARSE ERROR:",
        parseError
      );
    }

    if (!res.ok) {
      console.error(
        "DELETE API ERROR:",
        responseText
      );

      window.alert(
        data?.error ||
          `Хэрэглэгч устгахад алдаа гарлаа.\nHTTP Status: ${res.status}`
      );

      return;
    }

    window.alert(
      data?.message ||
        "Хэрэглэгч амжилттай устгагдлаа."
    );

    // Admin хэрэглэгчийн хуудсыг шинээр ачаална
    window.location.href = "/admin/users";
  } catch (error) {
    console.error(
      "DELETE USER FETCH ERROR:",
      error
    );

    window.alert(
      "Сервертэй холбогдох үед алдаа гарлаа."
    );
  }
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
              department:
                e.target.value,
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
              position:
                e.target.value,
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

        <div className="row">

          <button
            type="button"
            className="btn success"
            onClick={updateUser}
          >
            Хадгалах
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setEditMode(false)
            }
          >
            Болих
          </button>

        </div>

        {message && (
          <div className="error">
            {message}
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="row">

      <button
        type="button"
        className="btn secondary"
        onClick={() =>
          setEditMode(true)
        }
      >
        Засах
      </button>

      <button
        type="button"
        className="btn warning"
        onClick={changePassword}
      >
        Нууц үг
      </button>

      <button
        type="button"
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

      <button
        type="button"
        className="delete-user-btn"
        onClick={deleteUser}
      >
        🗑 Устгах
      </button>

    </div>
  );
}