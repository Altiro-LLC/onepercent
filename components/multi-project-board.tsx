"use client";

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  Flame,
  Trophy,
  Pencil,
  Trash2,
  Notebook,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Confetti from "react-confetti";
import StaleTasksButton from "./ui/StaleTasksButton";
import NotesModal from "./ui/NotesModal";
import PrioritizeButton from "./ui/PrioritizeButton";
import AnimatedCircularProgress from "./ui/AnimatedCircularProgress";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  lastUpdated?: Date; // Updated whenever the task is edited
  recurringTaskId?: string;
}

export interface RecurringTask {
  title: string;
  intervalDays: number;
  recurringTaskId: string;
  lastRunDate: Date | null;
  completedAt: Date | null;
}

export interface Project {
  _id: string;
  id: string;
  name: string;
  tasks: Task[];
  streak: number;
  lastCompletionDate: Date | null;
  showCompleted: boolean;
  notes?: string;
  priority: number;
  recurringTasks: RecurringTask[];
  projectHealth: number;
}

function isTaskStale(task: Task): boolean {
  const now = new Date();
  const lastUpdate = task.lastUpdated
    ? new Date(task.lastUpdated)
    : new Date(task.createdAt);

  // Calculate the difference in days between now and the last update date.
  const differenceInTime = now.getTime() - lastUpdate.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days

  return differenceInDays > 5 && !task.completed;
}

function convertUrlsToLinks(text: string): JSX.Element {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            [link]
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function Component() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [newProjectName, setNewProjectName] = useState("");
  const [newTasks, setNewTasks] = useState<{ [key: string]: string }>({});
  const [editingTask, setEditingTask] = useState<{
    projectId: string;
    taskId: string;
  } | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState<string>("");
  const [isConfetti, setIsConfetti] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

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

  const saveNotes = async (notes: string) => {
    if (!currentProjectId) return;

    try {
      // Find the project to get its _id
      const project = projects.find((p) => p.id === currentProjectId);
      if (!project?._id) return;

      console.log("Saving notes for project:", project._id); // Add this for debugging

      const response = await fetch(`/api/projects/${project._id}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Add this for debugging
        throw new Error(`Failed to save notes: ${errorData.message}`);
      }

      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === currentProjectId ? { ...p, notes } : p
        )
      );
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const openNotesModal = (projectId: string) => {
    setCurrentProjectId(projectId);
    setIsNotesModalOpen(true);
  };

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
        console.log("sortedProjects", sortedProjects);
        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [sortProjects]);

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
  }, []);

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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const allProjectsCompletedToday = projects.every((project) =>
        project.tasks.some(
          (task) =>
            task.completed &&
            task.completedAt &&
            isSameDay(new Date(task.completedAt), today)
        )
      );
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

          if (!allProjectsCompletedToday) {
            // check again if now all projects have at least one task completed
            const allProjectsCompletedTodayNow = updatedProjects.every(
              (project) =>
                project.tasks.some(
                  (task) =>
                    task.completed &&
                    task.completedAt &&
                    isSameDay(new Date(task.completedAt), today)
                )
            );

            if (allProjectsCompletedTodayNow) {
              console.log("setting isConfetti to true");
              setIsConfetti(true);
              setTimeout(() => {
                setIsConfetti(false);
              }, 3000);
            }
          }
          return sortProjects(updatedProjects);
        });
      } catch (error) {
        console.error("Error completing task:", error);
      }
    },
    [sortProjects, projects]
  );

  return (
    <div className="container mx-auto p-4">
      {isConfetti && <Confetti tweenDuration={3000} />}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">OnePercent</h1>
        <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-full">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span className="font-bold text-yellow-700 dark:text-yellow-300">
            Overall Streak: 0
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
        <StaleTasksButton projects={projects} />
        <PrioritizeButton projects={projects} />
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`flex flex-col ${
                isProjectCompletedToday(project)
                  ? "bg-green-100 dark:bg-green-900"
                  : ""
              } transition-colors duration-300 h-full`}
            >
              <div className="flex-grow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <AnimatedCircularProgress value={project.projectHealth} />
                  <CardTitle>{project.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openNotesModal(project.id)}
                    >
                      <Notebook className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-bold text-orange-500">
                        {project.streak}
                      </span>
                    </div>
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
                      .filter(
                        (task) => task.completed === project.showCompleted
                      )
                      .map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center space-x-2"
                        >
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
                                {convertUrlsToLinks(task.title)}
                              </label>
                              {isTaskStale(task) && (
                                <span className="text-red-500 text-xs bg-red-100 p-1 rounded">
                                  Stale
                                </span>
                              )}
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

                  {/* <div className="mt-4 flex items-center space-x-2">
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
                </div> */}
                </CardContent>
              </div>
              <div className="mt-auto p-4">
                <div className="flex items-center space-x-2">
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
                    className="flex-grow bg-white"
                  />
                  <Button onClick={() => addNewTask(project.id)} size="sm">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
      {currentProjectId && (
        <NotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          initialNotes={
            projects.find((p) => p.id === currentProjectId)?.notes || ""
          }
          onSave={saveNotes}
        />
      )}
    </div>
  );
}
