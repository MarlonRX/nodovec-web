import React from "react";

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
  <div
    className="w-full h-[60vh] flex items-center justify-center"
    style={{ backgroundColor: "var(--bg-primary)" }}
  >
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-10 h-10 rounded-full border-4 border-transparent animate-spin"
        style={{
          borderTopColor: "var(--accent-primary)",
          borderRightColor: "var(--accent-primary)",
        }}
      />
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {message}
      </p>
    </div>
  </div>
);
