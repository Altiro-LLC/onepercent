// app/api/tasks/route.ts
import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, title } = await req.json();
    console.log("projectId", projectId);
    const newTask = {
      id: new ObjectId().toString(),
      title,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    const result = await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(projectId) },
        { $push: { tasks: newTask } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, taskId } = await req.json();

    const result = await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(projectId) },
        { $pull: { tasks: { id: taskId } } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Task or project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    console.log("PUT");
    const { projectId, taskId, completed, title } = await req.json();

    // Build the update object for the task fields.
    const update: any = {};
    if (typeof completed === "boolean") {
      update["tasks.$.completed"] = completed;
      update["tasks.$.completedAt"] = completed ? new Date() : null;
    }
    if (title) {
      update["tasks.$.title"] = title;
    }

    // Update the `lastUpdated` timestamp
    update["tasks.$.lastUpdated"] = new Date();

    // Find the project to check streak conditions.
    const project = await db.collection("projects").findOne({
      _id: new ObjectId(projectId),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompletionDate = project.lastCompletionDate
      ? new Date(project.lastCompletionDate)
      : null;

    const hasTaskCompletedToday = project.tasks.some(
      (task) =>
        task.completed &&
        task.completedAt &&
        isSameDay(new Date(task.completedAt), today)
    );

    // Determine if the streak needs to be adjusted.
    let newStreak = project.streak;
    let newLastCompletionDate = project.lastCompletionDate;

    if (completed) {
      // If marking a task as completed today and it's the first completion today, update the streak.
      if (!hasTaskCompletedToday) {
        newStreak += 1;
        newLastCompletionDate = today;
      } else if (lastCompletionDate) {
        const dayDifference = Math.floor(
          (today.getTime() - lastCompletionDate.getTime()) / (1000 * 3600 * 24)
        );

        if (dayDifference === 1) {
          // Increment streak for consecutive days.
          newStreak += 1;
          newLastCompletionDate = today;
        } else if (dayDifference > 1) {
          // Reset streak for non-consecutive days.
          newStreak = 1;
          newLastCompletionDate = today;
        }
      }
    } else {
      // If marking a task as incomplete and it was completed today, adjust the streak.
      const wasCompletedToday = project.tasks.find(
        (task) =>
          task.id === taskId &&
          task.completedAt &&
          isSameDay(new Date(task.completedAt), today)
      );

      if (wasCompletedToday) {
        // Check if there are any other tasks completed today.
        const otherTasksCompletedToday = project.tasks.some(
          (task) =>
            task.id !== taskId &&
            task.completed &&
            task.completedAt &&
            isSameDay(new Date(task.completedAt), today)
        );

        if (!otherTasksCompletedToday) {
          // Decrement the streak if no other tasks are completed today.
          newStreak -= 1;
          newLastCompletionDate = null;
        }
      }
    }

    // Update the task.
    const result = await db.collection("projects").updateOne(
      {
        _id: new ObjectId(projectId),
        "tasks.id": taskId,
      },
      {
        $set: update,
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Task or project not found" },
        { status: 404 }
      );
    }

    // Update the project's streak.
    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          streak: newStreak < 0 ? 0 : newStreak, // Ensure streak does not go below 0.
          lastCompletionDate: newLastCompletionDate,
        },
      }
    );

    // Update the project's streak.
    const updatedProject = await db.collection("projects").findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          streak: newStreak < 0 ? 0 : newStreak, // Ensure streak does not go below 0.
          lastCompletionDate: newLastCompletionDate,
        },
      },
      { returnOriginal: false }
    );

    return NextResponse.json({
      message: "Task updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// Utility function to compare if two dates are the same day.
function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
