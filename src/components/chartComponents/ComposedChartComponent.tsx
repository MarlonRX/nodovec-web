import React, { lazy, Suspense } from "react";

import { ComposedChartProps } from "./types";
import { formatCurrency } from "../../lib/currencyFormatter";

const formatAxisValue = (value: number) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
};

const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid var(--border-primary)`,
                    borderRadius: "8px",
                    padding: "10px",
                    color: 'var(--text-primary)',
                }}
            >
                <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
                {payload.map((entry: any) => (
                    <p
                        key={entry.name}
                        style={{ margin: "4px 0", color: entry.color }}
                    >
                        {entry.name}: {formatCurrency(entry.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Lazy-load the whole chart as a single unit so recharts' primitives stay
// direct children of each other (they rely on parent/child relationships).
const ComposedChartImpl = lazy(async () => {
    const {
        ComposedChart,
        Bar,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
        ResponsiveContainer,
    } = await import("recharts");

    const Chart: React.FC<ComposedChartProps> = ({
        data,
        bars = [],
        lines = [],
        xAxisKey = "month",
        height = 320,
        showLegend = true,
        showGrid = true,
        showTooltip = true,
    }) => {
        return (
            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={data}>
                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border-secondary)"
                        />
                    )}
                    <XAxis
                        dataKey={xAxisKey}
                        stroke="var(--text-secondary)"
                    />
                    <YAxis
                        stroke="var(--text-secondary)"
                        tickFormatter={formatAxisValue}
                    />
                    {showTooltip && (
                        <Tooltip content={<CustomTooltip />} />
                    )}
                    {showLegend && (
                        <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                    )}
                    {bars.map((bar) => (
                        <Bar
                            key={bar.dataKey}
                            dataKey={bar.dataKey}
                            fill={bar.fill}
                            name={bar.name || bar.dataKey}
                        />
                    ))}
                    {lines.map((line) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            stroke={line.stroke}
                            strokeWidth={line.strokeWidth || 2}
                            name={line.name || line.dataKey}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    return { default: Chart };
});

const ComposedChartComponent: React.FC<ComposedChartProps> = (props) => (
    <Suspense fallback={<div style={{ width: "100%", height: `${props.height ?? 320}px` }} />}>
        <ComposedChartImpl {...props} />
    </Suspense>
);

export default ComposedChartComponent;
