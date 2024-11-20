// app/api/tasks/route.ts
import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

import { v4 as uuidv4 } from "uuid"; // Generate unique IDs for recurring tasks
import { Task } from "@/components/multi-project-board";

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, title, recurrence } = await req.json();

    // Define the new task data
    const newTask = {
      id: new ObjectId().toString(),
      title,
      completed: false,
      completedAt: null,
      createdAt: new Date(),
      lastUpdated: new Date(),
      notes: "",
    };

    console.log("recurrence", recurrence);

    // Check if the task is a recurring task
    if (recurrence) {
      const recurringTask = {
        title,
        intervalDays: recurrence,
        recurringTaskId: uuidv4(), // Unique ID for the recurring task
        lastRunDate: null,
        completedAt: null,
      };

      // Step 1: Check if `recurringTasks` exists or is null
      const project = await db.collection("projects").findOne({
        _id: ObjectId.createFromHexString(projectId),
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Step 2: Initialize `recurringTasks` as an empty array if it's null or undefined
      if (!Array.isArray(project.recurringTasks)) {
        await db
          .collection("projects")
          .updateOne(
            { _id: ObjectId.createFromHexString(projectId) },
            { $set: { recurringTasks: [] } }
          );
      }

      // Step 3: Push the recurring task to `recurringTasks`
      const result = await db.collection("projects").updateOne(
        { _id: ObjectId.createFromHexString(projectId) },
        // @ts-expect-error `recurringTasks` is initialized above
        { $push: { recurringTasks: recurringTask } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Project not updated" },
          { status: 500 }
        );
      }

      return NextResponse.json(recurringTask, { status: 201 });
    } else {
      // Add a regular task to `tasks`
      const result = await db.collection("projects").updateOne(
        { _id: new ObjectId(projectId) },
        // @ts-expect-error `tasks` is initialized above
        { $push: { tasks: newTask } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Project not updated" },
          { status: 500 }
        );
      }

      return NextResponse.json(newTask, { status: 201 });
    }
  } catch (error) {
    console.error("Failed to add task:", error);
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, taskId } = await req.json();

    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      // @ts-expect-error `tasks` is initialized above
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
    const update: { [key: string]: unknown } = {};
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
      (task: Task) =>
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
        (task: Task) =>
          task.id === taskId &&
          task.completedAt &&
          isSameDay(new Date(task.completedAt), today)
      );

      if (wasCompletedToday) {
        // Check if there are any other tasks completed today.
        const otherTasksCompletedToday = project.tasks.some(
          (task: Task) =>
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
      // @ts-expect-error `returnOriginal` is a valid option
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
