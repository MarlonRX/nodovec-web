import React, { lazy, Suspense } from "react";

import { LineChartProps } from "./types";
import { formatCurrency } from "../../lib/currencyFormatter";

interface SimpleLineChartProps extends LineChartProps {
    xAxisKey?: string;
    yAxisDomain?: [number, number];
}

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
const SimpleLineChartImpl = lazy(async () => {
    const {
        LineChart,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
        ResponsiveContainer,
    } = await import("recharts");

    const Chart: React.FC<SimpleLineChartProps> = ({
        data,
        dataKey,
        stroke = 'var(--accent-primary)',
        strokeWidth = 2,
        dot = false,
        curveType = "monotone",
        height = 300,
        showLegend = true,
        showGrid = true,
        showTooltip = true,
        xAxisKey = "month",
        yAxisDomain,
    }) => {
        return (
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data}>
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
                        domain={yAxisDomain}
                        tickFormatter={formatAxisValue}
                    />
                    {showTooltip && (
                        <Tooltip content={<CustomTooltip />} />
                    )}
                    {showLegend && (
                        <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                    )}
                    <Line
                        type={curveType}
                        dataKey={dataKey}
                        stroke={stroke}
                        dot={dot}
                        strokeWidth={strokeWidth}
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    };

    return { default: Chart };
});

const SimpleLineChart: React.FC<SimpleLineChartProps> = (props) => (
    <Suspense fallback={<div style={{ width: "100%", height: `${props.height ?? 300}px` }} />}>
        <SimpleLineChartImpl {...props} />
    </Suspense>
);

export default SimpleLineChart;
