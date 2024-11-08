import React, { useEffect, useState } from "react";

interface AnimatedCircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  value,
  size = 50,
  strokeWidth = 4,
  color = "#22c55e", // Default color similar to green.400 in Chakra
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 1;
      if (progressValue <= value) {
        setProgress(progressValue);
      } else {
        clearInterval(interval);
      }
    }, 20); // Adjust the interval time for speed
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [value]);

  // Calculate circle properties for SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size}>
        <circle
          stroke="#e5e7eb" // Background color (light gray)
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color} // Foreground color for progress
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: "stroke-dashoffset 0.2s ease",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          fontSize: "0.8em",
          color: color,
        }}
      >
        {progress}%
      </span>
    </div>
  );
};

export default AnimatedCircularProgress;
