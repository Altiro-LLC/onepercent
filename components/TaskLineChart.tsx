import React from "react";
import Chart from "react-apexcharts";
import { Task } from "./multi-project-board";
import { ApexOptions } from "apexcharts";

interface TaskCompletionChartProps {
  data: Task[];
}

const TaskCompletionChart = ({ data }: TaskCompletionChartProps) => {
  const transformData = (data: Task[]) => {
    // Group and count tasks by completion date
    const grouped = data.reduce<Record<string, number>>((acc, task) => {
      if (!task.completedAt) return acc;
      const date = new Date(task.completedAt).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Sort dates and limit to the last 7 days
    const sortedDates = Object.keys(grouped).sort();
    const last7Dates = sortedDates.slice(-7); // Get only the last 7 dates

    return {
      labels: last7Dates,
      series: last7Dates.map((date) => grouped[date]),
    };
  };

  const chartData = transformData(data);
  const chartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: "bar", // Use bar chart for better readability
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4, // Rounded edges
        horizontal: false,
        columnWidth: "60%", // Adjust bar width
      },
    },
    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: chartData.labels,
      title: {
        text: "Date",
      },
      labels: {
        rotate: -45, // Rotate labels for better readability
      },
    },
    yaxis: {
      title: {
        text: "Tasks Completed",
      },
      min: 0,
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
  };

  const chartSeries = [
    {
      name: "Tasks Completed",
      data: chartData.series, // Y-axis data
    },
  ];

  return (
    <div id="chart">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={350}
      />
    </div>
  );
};

export default TaskCompletionChart;
