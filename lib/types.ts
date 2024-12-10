export type RecurrenceRules = {
  intervalDays: number;
  lastRunDate: string;
};

export type Task = {
  id: string;
  title: string;
  isRecurring: boolean;
  completed: boolean;
  priority: number;
  tag: string;
  recurrenceRules?: RecurrenceRules; // Optional since not all tasks have recurrence rules
};

export type Goal = {
  id: string;
  name: string;
  unitsOfProgress: number | null;
  deadline: string | null;
  throughput: number;
  tasks: Task[];
};

export type Analytics = {
  projectHealth: number;
  streak: number;
  lastCompletionDate: string;
};

export interface Project {
  _id: string;
  name: string;
  health: number;
  streak: number;
  analytics: {
    views: number;
    conversions: number;
  };
  goals: {
    name: string;
    tasks: Task[];
  }[];
  priority: number;
  notes?: string;
  createdAt: Date;
  lastUpdated: Date;
}
