import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/document_approval";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true },
    passwordHash: String,
    department: String,
    position: String,
    role: String,
    isActive: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(uri);

  const users = [
    {
      name: "Системийн админ",
      username: "admin",
      password: "123456",
      department: "Мэдээлэл технологийн алба",
      position: "Админ",
      role: "ADMIN",
    },
    {
      name: "Б.Бат",
      username: "bat",
      password: "123456",
      department: "Мэдээлэл технологийн алба",
      position: "Мэргэжилтэн",
      role: "EMPLOYEE",
    },
    {
      name: "Д.Дорж",
      username: "darga",
      password: "123456",
      department: "Мэдээлэл технологийн алба",
      position: "Албаны дарга",
      role: "REVIEWER",
    },
    {
      name: "Г.Ган",
      username: "director",
      password: "123456",
      department: "Удирдлага",
      position: "Захирал",
      role: "DIRECTOR",
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.updateOne(
      { username: u.username },
      {
        $set: {
          name: u.name,
          username: u.username,
          passwordHash,
          department: u.department,
          position: u.position,
          role: u.role,
          isActive: true,
        },
      },
      { upsert: true }
    );
  }

  console.log("Seed дууслаа.");
  console.log("admin / 123456");
  console.log("bat / 123456");
  console.log("darga / 123456");
  console.log("director / 123456");

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
