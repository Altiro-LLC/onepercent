// app/api/overall-streak/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const overallStreak = await db.collection("overall_streak").findOne({});
    return NextResponse.json(
      overallStreak || { streak: 0, lastCompletionDate: null }
    );
  } catch (error) {
    console.error("Error fetching overall streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch overall streak" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const projects = await db.collection("projects").find({}).toArray();
    const allProjectsCompletedToday = projects.every((project) =>
      project.tasks.some(
        (task) =>
          task.completed &&
          task.completedAt &&
          isSameDay(new Date(task.completedAt), today)
      )
    );

    console.log("All projects completed today:", allProjectsCompletedToday);

    let overallStreak = await db.collection("overall_streak").findOne({});
    if (!overallStreak) {
      overallStreak = { streak: 0, lastCompletionDate: null };
    }

    console.log("Current overall streak:", overallStreak);

    if (allProjectsCompletedToday) {
      if (overallStreak.lastCompletionDate) {
        const lastCompletion = new Date(overallStreak.lastCompletionDate);
        const dayDifference = Math.floor(
          (today.getTime() - lastCompletion.getTime()) / (1000 * 3600 * 24)
        );

        if (dayDifference === 1) {
          overallStreak.streak += 1;
        } else if (dayDifference > 1) {
          overallStreak.streak = 1;
        }
      } else {
        overallStreak.streak = 1;
      }
      overallStreak.lastCompletionDate = today;
    } else {
      overallStreak.streak = 0;
      overallStreak.lastCompletionDate = null;
    }

    console.log("Updated overall streak:", overallStreak);

    await db
      .collection("overall_streak")
      .updateOne({}, { $set: overallStreak }, { upsert: true });

    return NextResponse.json(overallStreak);
  } catch (error) {
    console.error("Error updating overall streak:", error);
    return NextResponse.json(
      { error: "Failed to update overall streak" },
      { status: 500 }
    );
  }
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
