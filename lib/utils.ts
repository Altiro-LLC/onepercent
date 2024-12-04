import { Project, Task } from "@/components/multi-project-board";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to populate recurring tasks
export function populateRecurringTasks(project: Project) {
  if (!project.recurringTasks) return;

  // Get today's date as a Date object set to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ensure today has no time component

  project.recurringTasks.forEach((recurringTask) => {
    const lastRunDate = recurringTask.lastRunDate;
    const intervalDays = recurringTask.intervalDays;

    // Check if the task with the recurringTaskId exists for today
    const taskExistsToday = project.tasks.some(
      (task) =>
        task.recurringTaskId === recurringTask.recurringTaskId &&
        new Date(task.completedAt || task.createdAt).setHours(0, 0, 0, 0) ===
          today.getTime()
    );

    // Check if the recurring task should run today based on intervalDays
    const isScheduledToday =
      !lastRunDate || // No last run date means the task should run
      (intervalDays &&
        Math.floor(
          (today.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24)
        ) >= intervalDays);

    // Add a new task if it doesn't exist for today and is scheduled today
    if (!taskExistsToday && isScheduledToday) {
      const newTask = {
        id: generateUniqueId(),
        title: recurringTask.title,
        completed: false,
        recurringTaskId: recurringTask.recurringTaskId,
        createdAt: new Date(),
        lastUpdated: new Date(),
        completedAt: null,
        priority: 0, // TODO: change this? Get the latest priority and increment it?
      };

      project.tasks.push(newTask); // Add new task to tasks array
      recurringTask.lastRunDate = new Date(today); // Update lastRunDate to today
    }
  });
}

// Helper function to generate unique IDs
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9); // Simple ID generator
}

export function calculateProjectHealth(project: Project): number {
  const today = new Date();
  const staleDaysLimit = 5;
  const staleTasks = project.tasks.filter((task) => {
    const isIncomplete = !task.completed;
    const taskAgeInDays = Math.floor(
      (today.getTime() - new Date(task.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return isIncomplete && taskAgeInDays > staleDaysLimit;
  }).length;

  const totalTasks = project.tasks.length;

  // Calculate health as a percentage
  const health = totalTasks > 0 ? 100 - (staleTasks / totalTasks) * 100 : 100; // Default to 100% if no tasks

  return Math.max(health, 0); // Ensure health is never negative
}

export function hasEnoughDataForChart(tasks: Task[]): boolean {
  // Get date 2 weeks ago
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Filter completed tasks within last 2 weeks
  const recentCompletedTasks = tasks.filter((task) => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= twoWeeksAgo;
  });

  // Get unique dates when tasks were completed
  const uniqueCompletionDates = new Set(
    recentCompletedTasks.map(
      (task) => new Date(task.completedAt!).toISOString().split("T")[0]
    )
  );

  // Return true if we have data for at least 3 different days in the last 2 weeks
  return uniqueCompletionDates.size >= 3;
}
