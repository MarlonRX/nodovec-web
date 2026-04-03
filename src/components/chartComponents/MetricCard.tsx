import React from "react";
import { MetricCardProps } from "./types";
import { colorConfig } from "../../styles/colorConfig";

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    trend,
    subtitle,
    chart,
}) => {
    return (
        <div
            className="rounded-lg p-6 shadow-sm"
            style={{
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid var(--border-primary)`,
            }} 
        >
            <div className="flex justify-between items-start mb-4">
                <h3
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {title}
                </h3>
                {trend && (
                    <span
                        className="text-sm font-semibold"
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
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
            >
                {value}
            </div>
            {subtitle && (
                <div
                    className="text-xs mb-4"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {subtitle}
                </div>
            )}
            {chart && <div className="h-auto">{chart}</div>}
        </div>
    );
};

export default MetricCard;