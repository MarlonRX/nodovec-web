import React from "react";
import { MetricCardProps } from "./types";

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    trend,
    subtitle,
    chart,
}) => {
    return (
        <div
            className="animate-fade-up rounded-none p-5 sm:p-6"
            style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-primary)",
            }}
        >
            <div className="flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <h3
                            className="text-xs font-semibold tracking-wide"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {title}
                        </h3>
                        {trend && (
                            <span
                                className="text-xs font-semibold whitespace-nowrap shrink-0 ml-2 font-financial"
                                style={{
                                    color: trend.isPositive
                                        ? 'var(--semantic-success)'
                                        : 'var(--semantic-error)',
                                }}
                            >
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                        )}
                    </div>
                    <div
                        className="text-3xl font-bold mb-1.5 font-financial tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {value}
                    </div>
                    {subtitle && (
                        <div
                            className="text-xs"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {subtitle}
                        </div>
                    )}
                </div>
                {chart && <div className="h-auto mt-3">{chart}</div>}
            </div>
        </div>
    );
};

export default MetricCard;
