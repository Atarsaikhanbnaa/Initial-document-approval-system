import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Nav from "@/components/Nav";
import AddUserForm from "@/components/AddUserForm";
import UserActions from "@/components/UserActions";

export default async function UsersPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  await connectDB();

  const users = await User.find({})
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <>
      <Nav name={session.name} position={session.position} />

      <main className="container grid">
        <div>
          <h1>Хэрэглэгчийн удирдлага</h1>
          <p className="muted">
            Ажилтан нэмэх, засах, нууц үг солих болон идэвхгүй болгох.
          </p>
        </div>

        <AddUserForm />

        <div className="card">
          <h2>Бүртгэлтэй хэрэглэгчид</h2>

          <table className="table">
            <thead>
              <tr>
                <th>Нэр</th>
                <th>Username</th>
                <th>Хэлтэс / Алба</th>
                <th>Албан тушаал</th>
                <th>Эрх</th>
                <th>Төлөв</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user: any) => (
                <tr key={user._id.toString()}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>

                  <td>{user.username}</td>

                  <td>{user.department}</td>

                  <td>{user.position}</td>

                  <td>
                    <span className="badge">{user.role}</span>
                  </td>

                  <td>
                    {user.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                  </td>

                  <td>
                    <UserActions
                      user={{
                        id: user._id.toString(),
                        name: user.name,
                        username: user.username,
                        department: user.department,
                        position: user.position,
                        role: user.role,
                        isActive: user.isActive,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}