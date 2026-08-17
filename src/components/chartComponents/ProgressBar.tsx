import React from "react";
import { ProgressBarProps } from "./types";
import { colorConfig } from "../../styles/colorConfig";

const ProgressBar: React.FC<ProgressBarProps> = ({
    label,
    value,
    max,
    color,
    backgroundColor,
    showPercentage = true,
    height = 8,
}) => {
    const percentage = (value / max) * 100;

    return (
        <div>
            <div className="flex justify-between mb-2">
                <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {label}
                </span>
                {showPercentage && (
                    <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {Math.round(percentage)}%
                    </span>
                )}
            </div>
            <div
                className="w-full rounded-full"
                style={{
                    height: `${height}px`,
                    backgroundColor: backgroundColor || 'var(--border-secondary)',
                }} 
            >
                <div
                    className="rounded-full transition-[width] duration-300"
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: `${height}px`,
                        backgroundColor: color,
                    }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;