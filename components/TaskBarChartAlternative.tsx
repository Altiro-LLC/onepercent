"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Task } from "./multi-project-board";

const transformData = (data: Task[]) => {
  const grouped = data.reduce<Record<string, number>>((acc, task) => {
    if (!task.completedAt) return acc;
    const date = new Date(task.completedAt).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();
  const last14Dates = sortedDates.slice(-14); // Get the last 14 days for comparison

  // Map each date to the day of the week
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const chartData = last14Dates.map((date) => {
    const dayOfWeek = new Date(date).getDay();
    return {
      day: dayNames[dayOfWeek],
      tasksCompleted: grouped[date],
    };
  });

  // Separate the last 7 days and the previous 7 days
  const last7DaysData = chartData.slice(-7);
  const previous7DaysData = chartData.slice(-14, -7);

  return { last7DaysData, previous7DaysData };
};

const calculateTrend = (
  last7DaysData: { tasksCompleted: number }[],
  previous7DaysData: { tasksCompleted: number }[]
) => {
  // Sum tasks completed in each 7-day period
  const last7DaysTotal = last7DaysData.reduce(
    (sum, day) => sum + day.tasksCompleted,
    0
  );
  const previous7DaysTotal = previous7DaysData.reduce(
    (sum, day) => sum + day.tasksCompleted,
    0
  );

  // Calculate the percentage change
  if (previous7DaysTotal === 0) return 0; // Avoid division by zero
  return ((last7DaysTotal - previous7DaysTotal) / previous7DaysTotal) * 100;
};

export function TaskCompletionChart({ data }: { data: Task[] }) {
  const { last7DaysData, previous7DaysData } = transformData(data);
  const trend = calculateTrend(last7DaysData, previous7DaysData);

  const chartConfig = {
    tasksCompleted: {
      label: "Tasks Completed",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Completed Over the Last 7 Days</CardTitle>
        <CardDescription>Showing task completions by weekday</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={last7DaysData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, "dataMax"]} // Ensure the Y-axis starts at 0 and adjusts to the max value dynamically
              allowDecimals={false}
              label={{
                value: "Tasks Completed",
                angle: -90,
                position: "insideLeft",
                dy: 30,
              }}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="tasksCompleted"
              fill="var(--color-tasksCompleted)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend >= 0 ? (
            <>
              Trending up by {trend.toFixed(1)}% this week{" "}
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(trend).toFixed(1)}% this week{" "}
              <TrendingDown className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing tasks completed by day of the week for the last 7 days
        </div>
      </CardFooter>
    </Card>
  );
}
