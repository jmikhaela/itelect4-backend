import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Session } from "./models/Session";
import { SESSIONS } from "./data/sessions";
import { Course } from "./models/Course";
import { COURSES } from "./data/courses";

async function seed() {
  await connectDB();

  for (const session of SESSIONS) {
    await Session.updateOne(
      { subject: session.subject },
      session,
      { upsert: true }
    );
  }
  console.log(`${SESSIONS.length} sessions seeded in ${mongoose.connection.name}`);

  for (const course of COURSES) {
    await Course.updateOne(
      { code: course.code },
      course,
      { upsert: true }
    );
  }
  console.log(`${COURSES.length} courses seeded in ${mongoose.connection.name}`);

  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
