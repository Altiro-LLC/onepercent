import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, BarChart2, Flame, Target } from "lucide-react";
import { Task } from "@/lib/types";

// interface Task {
//   id: string;
//   description: string;
//   completed: boolean;
// }

interface ProjectCardProps {
  name: string;
  health: number;
  streak: number;
  analytics: {
    views: number;
    conversions: number;
  };
  goal: string;
  dailyTasks: Task[];
}

export default function ProjectCard({
  name,
  health,
  streak,
  analytics,
  goal,
  dailyTasks,
}: ProjectCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <CardDescription>Project Overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="font-semibold">Project Health</span>
          </div>
          <Progress value={health} className="w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold">Streak</span>
          </div>
          <Badge variant="secondary">{streak} days</Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            <span className="font-semibold">Analytics</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Views: {analytics.views}</span>
            <span>Conversions: {analytics.conversions}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <span className="font-semibold">Project Goal</span>
          </div>
          <p className="text-sm text-muted-foreground">{goal}</p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-2">
          <h4 className="font-semibold">Daily Tasks</h4>
          <ScrollArea className="h-[150px] w-full rounded-md border p-4">
            {dailyTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-2 mb-2">
                <Checkbox id={task.id} checked={task.completed} />
                <label
                  htmlFor={task.id}
                  className={`text-sm ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </label>
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardFooter>
    </Card>
  );
}
