"use client";

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Flame, Trophy, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: Date | null;
}

interface Project {
  _id: string;
  id: string;
  name: string;
  tasks: Task[];
  streak: number;
  lastCompletionDate: Date | null;
  showCompleted: boolean;
}

export default function Component() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [newProjectName, setNewProjectName] = useState("");
  const [overallStreak, setOverallStreak] = useState(0);
  const [newTasks, setNewTasks] = useState<{ [key: string]: string }>({});
  const [editingTask, setEditingTask] = useState<{
    projectId: string;
    taskId: string;
  } | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState<string>("");

  const sortProjects = useCallback((projectsToSort: Project[]) => {
    return [...projectsToSort].sort((a, b) => {
      const aCompletedToday = a.tasks.some(
        (task) =>
          task.completed &&
          task.completedAt &&
          isSameDay(new Date(task.completedAt), new Date())
      );
      const bCompletedToday = b.tasks.some(
        (task) =>
          task.completed &&
          task.completedAt &&
          isSameDay(new Date(task.completedAt), new Date())
      );

      if (aCompletedToday && !bCompletedToday) return 1;
      if (!aCompletedToday && bCompletedToday) return -1;
      return 0;
    });
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();

        const formattedProjects = data.map((project: Project) => ({
          ...project,
          id: project._id,
        }));

        const sortedProjects = sortProjects(formattedProjects);
        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [sortProjects]);

  useEffect(() => {
    const fetchOverallStreak = async () => {
      try {
        const response = await fetch("/api/overall-streak");
        if (!response.ok) throw new Error("Failed to fetch overall streak");
        const data = await response.json();
        setOverallStreak(data.streak);
      } catch (error) {
        console.error("Error fetching overall streak:", error);
      }
    };

    if (projects.length > 0) {
      fetchOverallStreak();
    }
  }, [projects]);

  const addNewProject = useCallback(async () => {
    if (newProjectName.trim() === "") return;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to add project");
      const newProject = await response.json();

      setProjects((prevProjects) => {
        const updatedProjects = [...prevProjects, newProject];
        return sortProjects(updatedProjects);
      });
      setNewProjectName("");
    } catch (error) {
      console.error("Error adding new project:", error);
    }
  }, [newProjectName, sortProjects]);

  const addNewTask = useCallback(
    async (projectId: string) => {
      console.log("projectId", projectId);
      const taskTitle = newTasks[projectId]?.trim();
      if (!taskTitle) return;

      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            title: taskTitle,
          }),
        });

        if (!response.ok) throw new Error("Failed to add task");
        const newTask = await response.json();

        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project.id === projectId
              ? { ...project, tasks: [...project.tasks, newTask] }
              : project
          )
        );

        setNewTasks((prev) => ({ ...prev, [projectId]: "" }));
      } catch (error) {
        console.error("Error adding new task:", error);
      }
    },
    [newTasks]
  );

  const updateOverallStreak = useCallback(async () => {
    try {
      const response = await fetch("/api/overall-streak", { method: "PUT" });
      if (!response.ok) throw new Error("Failed to update overall streak");
      const data = await response.json();
      setOverallStreak(data.streak);
    } catch (error) {
      console.error("Error updating overall streak:", error);
    }
  }, []);

  const updateStreaks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        const projectCompletedToday = project.tasks.some(
          (task) =>
            task.completed &&
            task.completedAt &&
            isSameDay(new Date(task.completedAt), today)
        );

        // if (!projectCompletedToday) {
        //   allProjectsCompletedToday = false;
        // }

        if (project.lastCompletionDate) {
          const lastCompletion = new Date(project.lastCompletionDate);
          lastCompletion.setHours(0, 0, 0, 0);

          const dayDifference = Math.floor(
            (today.getTime() - lastCompletion.getTime()) / (1000 * 3600 * 24)
          );

          if (dayDifference === 1 && projectCompletedToday) {
            return {
              ...project,
              streak: project.streak + 1,
              lastCompletionDate: today,
            };
          } else if (dayDifference > 1 || !projectCompletedToday) {
            return {
              ...project,
              streak: projectCompletedToday ? 1 : 0,
              lastCompletionDate: projectCompletedToday ? today : null,
            };
          }
        } else if (projectCompletedToday) {
          return { ...project, streak: 1, lastCompletionDate: today };
        }

        return project;
      })
    );

    updateOverallStreak();
  }, [updateOverallStreak]);

  useEffect(() => {
    updateStreaks();
    const intervalId = setInterval(updateStreaks, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(intervalId);
  }, [updateStreaks]);

  const isTaskCompletedToday = (task: Task) => {
    if (!task.completedAt) return false;
    return isSameDay(new Date(task.completedAt), new Date());
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isProjectCompletedToday = useCallback((project: Project) => {
    return project.tasks.some(isTaskCompletedToday);
  }, []);

  const handleNewTaskKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, projectId: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addNewTask(projectId);
      }
    },
    [addNewTask]
  );

  const toggleShowCompleted = useCallback((projectId: string) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? { ...project, showCompleted: !project.showCompleted }
          : project
      )
    );
  }, []);

  const startEditingTask = useCallback(
    (projectId: string, taskId: string, currentTitle: string) => {
      setEditingTask({ projectId, taskId });
      setEditedTaskTitle(currentTitle);
    },
    []
  );

  const saveEditedTask = useCallback(async () => {
    if (!editingTask) return;

    const { projectId, taskId } = editingTask;

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          taskId,
          title: editedTaskTitle,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, title: editedTaskTitle }
                    : task
                ),
              }
            : project
        )
      );

      setEditingTask(null);
      setEditedTaskTitle("");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }, [editingTask, editedTaskTitle]);

  const cancelEditingTask = useCallback(() => {
    setEditingTask(null);
    setEditedTaskTitle("");
  }, []);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, taskId }),
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.filter((task) => task.id !== taskId),
              }
            : project
        )
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }, []);

  const completeTask = useCallback(
    async (projectId: string, taskId: string, completed: boolean) => {
      try {
        const response = await fetch("/api/tasks", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            taskId,
            completed,
          }),
        });

        if (!response.ok) throw new Error("Failed to complete task");

        const updatedProject = await response.json();
        setProjects((prevProjects) => {
          const updatedProjects = prevProjects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: project.tasks.map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          completed,
                          completedAt: completed ? new Date() : null,
                        }
                      : task
                  ),
                  streak: updatedProject.project.streak,
                  lastCompletionDate: updatedProject.project.lastCompletionDate,
                }
              : project
          );
          return sortProjects(updatedProjects);
        });

        // Update overall streak
        const overallStreakResponse = await fetch("/api/overall-streak", {
          method: "PUT",
        });
        if (overallStreakResponse.ok) {
          const overallStreakData = await overallStreakResponse.json();
          setOverallStreak(overallStreakData.streak);
        } else {
          console.error("Failed to update overall streak");
        }
      } catch (error) {
        console.error("Error completing task:", error);
      }
    },
    [sortProjects]
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">OnePercent</h1>
        <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-full">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="font-bold text-yellow-700 dark:text-yellow-300">
            Overall Streak: {overallStreak}
          </span>
        </div>
      </div>
      <div className="mb-4 flex space-x-2">
        <Input
          type="text"
          placeholder="New project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={addNewProject}>Add Project</Button>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`${
                isProjectCompletedToday(project)
                  ? "bg-green-100 dark:bg-green-900"
                  : ""
              } transition-colors duration-300`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{project.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-orange-500">
                    {project.streak}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    id={`show-completed-${project.id}`}
                    checked={project.showCompleted}
                    onCheckedChange={() => toggleShowCompleted(project.id)}
                  />
                  <Label htmlFor={`show-completed-${project.id}`}>
                    {project.showCompleted
                      ? "Showing completed"
                      : "Showing to-do"}
                  </Label>
                </div>
                <ul className="space-y-6">
                  {project.tasks
                    .filter((task) => task.completed === project.showCompleted)
                    .map((task) => (
                      <li key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={task.id}
                          checked={task.completed}
                          onCheckedChange={() =>
                            completeTask(project.id, task.id, !task.completed)
                          }
                        />
                        {editingTask?.projectId === project.id &&
                        editingTask?.taskId === task.id ? (
                          <div className="flex-grow flex items-center space-x-2">
                            <Input
                              value={editedTaskTitle}
                              onChange={(e) =>
                                setEditedTaskTitle(e.target.value)
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveEditedTask();
                                }
                              }}
                              className="flex-grow"
                            />
                            <Button onClick={saveEditedTask} size="sm">
                              Save
                            </Button>
                            <Button
                              onClick={cancelEditingTask}
                              size="sm"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <label
                              htmlFor={task.id}
                              className={`flex-grow ${
                                task.completed
                                  ? "line-through text-gray-500"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </label>
                            <Button
                              onClick={() =>
                                startEditingTask(
                                  project.id,
                                  task.id,
                                  task.title
                                )
                              }
                              size="sm"
                              variant="ghost"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteTask(project.id, task.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {isTaskCompletedToday(task) && (
                          <span className="text-green-500 text-sm">
                            Completed today
                          </span>
                        )}
                      </li>
                    ))}
                </ul>

                <div className="mt-4 flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="New task"
                    value={newTasks[project.id] || ""}
                    onChange={(e) =>
                      setNewTasks({ ...newTasks, [project.id]: e.target.value })
                    }
                    onKeyPress={(e) =>
                      handleNewTaskKeyPress(e, project.id.toString())
                    }
                    className="flex-grow"
                    style={{ backgroundColor: "white" }}
                  />
                  <Button onClick={() => addNewTask(project.id)} size="sm">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
