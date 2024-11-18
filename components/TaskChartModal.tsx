"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BarChart } from "lucide-react";
import TaskLineChart from "./TaskLineChart";
import { Task } from "./multi-project-board";
import { TaskCompletionChart } from "./TaskBarChartAlternative";

interface TaskChartModalProps {
  data: Task[];
}

export default function TaskChartModal({ data }: TaskChartModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {/* <DialogHeader>
          <DialogTitle>Tasks Completed over the past 7 Days</DialogTitle>
        </DialogHeader> */}
        <div className="py-4">
          {/* Add your chart component here */}
          {/* <TaskLineChart data={data} /> */}
          <TaskCompletionChart data={data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
