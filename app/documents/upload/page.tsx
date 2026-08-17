import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Nav from "@/components/Nav";
import UploadForm from "@/components/UploadForm";

export default async function UploadPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const reviewers = await User.find({
    isActive: true,
    role: { $in: ["REVIEWER", "DIRECTOR", "ADMIN"] },
  })
    .select("name position department")
    .lean();

  const clean = reviewers.map((u: any) => ({
    id: u._id.toString(),
    name: u.name,
    position: u.position,
    department: u.department,
  }));

  return (
    <>
      <Nav name={session.name} position={session.position} />
      <main className="container">
        <UploadForm reviewers={clean} />
      </main>
    </>
  );
}
