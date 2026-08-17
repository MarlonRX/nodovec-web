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
        <div className="glass-panel rounded-2xl p-6 transition-shadow duration-300 relative overflow-hidden">
            {/* Subtle light glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--accent-primary-rgb),0.02),transparent_70%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <h3
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {title}
                        </h3>
                        {trend && (
                            <span
                                className="text-sm font-semibold whitespace-nowrap shrink-0 ml-2 font-financial"
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
                        className="text-3xl font-bold mb-2 font-financial"
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
                </div>
                {chart && <div className="h-auto mt-2">{chart}</div>}
            </div>
        </div>
    );
};

export default MetricCard;