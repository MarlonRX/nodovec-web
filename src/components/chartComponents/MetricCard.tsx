import React from "react";
import { MetricCardProps } from "./types";
import { BentoCard } from "../reactbits/MagicBento";
import CountUp from "../reactbits/CountUp";

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    valueNumeric,
    formatValue,
    accent = "var(--accent-primary)",
    delay = 0,
    trend,
    subtitle,
    chart,
}) => {
    return (
        <BentoCard
            className="animate-fade-up glass-panel rounded-none p-5 sm:p-6"
            style={{ animationDelay: `${delay}ms` }}
            enableStars={false}
        >
            <div
                className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                style={{ background: `linear-gradient(90deg, ${accent}, transparent 75%)` }}
            />
            <div className="relative z-[2] flex flex-col h-full justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <h3
                            className="text-xs font-semibold tracking-wide uppercase"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {title}
                        </h3>
                        {trend && (
                            <span
                                className="text-xs font-semibold whitespace-nowrap shrink-0 ml-2 font-financial px-1.5 py-0.5"
                                style={{
                                    color: trend.isPositive
                                        ? "var(--semantic-success)"
                                        : "var(--semantic-error)",
                                    backgroundColor: trend.isPositive
                                        ? "rgba(var(--semantic-success-rgb), 0.12)"
                                        : "rgba(var(--semantic-error-rgb), 0.12)",
                                }}
                            >
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                        )}
                    </div>
                    <div
                        className="text-3xl font-bold mb-1.5 font-financial tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {typeof valueNumeric === "number" ? (
                            <CountUp to={valueNumeric} format={formatValue} duration={0.6} />
                        ) : (
                            value
                        )}
                    </div>
                    {subtitle && (
                        <div
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {subtitle}
                        </div>
                    )}
                </div>
                {chart && <div className="h-auto mt-3">{chart}</div>}
            </div>
        </BentoCard>
    );
};

export default MetricCard;
