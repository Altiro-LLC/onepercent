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

    // Fetch all projects
    const projects = await db.collection("projects").find({}).toArray();

    // Get current overall streak
    let overallStreak = await db.collection("overall_streak").findOne({});
    if (!overallStreak) {
      overallStreak = { streak: 0, lastCompletionDate: null };
    }

    // Check if all projects have at least one task completed today
    const allProjectsCompletedToday = projects.every((project) =>
      project.tasks.some(
        (task) =>
          task.completed &&
          task.completedAt &&
          isSameDay(new Date(task.completedAt), today)
      )
    );

    // Get the previous state - did we have all projects completed before this update?
    const wasCompletedToday =
      overallStreak.lastCompletionDate &&
      isSameDay(new Date(overallStreak.lastCompletionDate), today);

    if (allProjectsCompletedToday) {
      const lastCompletionDate = overallStreak.lastCompletionDate
        ? new Date(overallStreak.lastCompletionDate)
        : null;

      if (lastCompletionDate) {
        lastCompletionDate.setHours(0, 0, 0, 0);
        const dayDifference = Math.floor(
          (today.getTime() - lastCompletionDate.getTime()) / (1000 * 3600 * 24)
        );

        // If this is the first completion today and it's consecutive
        if (dayDifference === 1) {
          overallStreak.streak += 1;
          overallStreak.lastCompletionDate = today;
        }
        // If this is the first completion today but not consecutive
        else if (dayDifference > 1) {
          overallStreak.streak = 1;
          overallStreak.lastCompletionDate = today;
        }
        // If same day, don't change streak
        else if (dayDifference === 0) {
          // Keep current streak and lastCompletionDate
        }
      } else {
        // First ever completion
        overallStreak.streak = 1;
        overallStreak.lastCompletionDate = today;
      }
    } else {
      // We no longer have all projects completed today
      if (wasCompletedToday) {
        // We had all projects completed today but now we don't
        // Decrement the streak and remove the completion date
        overallStreak.streak = Math.max(0, overallStreak.streak - 1);

        // If streak is now 0, reset lastCompletionDate
        if (overallStreak.streak === 0) {
          overallStreak.lastCompletionDate = null;
        } else {
          // Find the last day before today where all projects were completed
          const projectLastCompletions = projects
            .map((project) =>
              project.lastCompletionDate
                ? new Date(project.lastCompletionDate)
                : null
            )
            .filter((date) => date && !isSameDay(date, today));

          if (projectLastCompletions.length > 0) {
            overallStreak.lastCompletionDate = new Date(
              Math.max(...projectLastCompletions.map((date) => date!.getTime()))
            );
          } else {
            overallStreak.lastCompletionDate = null;
          }
        }
      } else {
        // Check if we should reset the streak due to missing a day
        const lastCompletionDate = overallStreak.lastCompletionDate
          ? new Date(overallStreak.lastCompletionDate)
          : null;

        if (lastCompletionDate) {
          lastCompletionDate.setHours(0, 0, 0, 0);
          const dayDifference = Math.floor(
            (today.getTime() - lastCompletionDate.getTime()) /
              (1000 * 3600 * 24)
          );

          // Only reset streak if we've missed a day
          if (dayDifference > 1) {
            overallStreak.streak = 0;
            overallStreak.lastCompletionDate = null;
          }
        }
      }
    }

    // Update the overall streak in the database
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
