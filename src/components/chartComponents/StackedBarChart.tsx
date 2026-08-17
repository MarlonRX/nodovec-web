import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { StackedBarChartProps } from "./types";
import { colorConfig } from "../../styles/colorConfig";
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
                {payload.map((entry: any, index: number) => (
                    <p
                        key={`tooltip-item-${index}`}
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

const StackedBarChart: React.FC<StackedBarChartProps> = ({
    data,
    bars = [],
    xAxisKey = "month",
    stackId = "stack",
    height = 320,
    showLegend = true,
    showGrid = true,
    showTooltip = true,
}) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
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
                {bars.map((bar, idx) => (
                    <Bar
                        key={`bar-${idx}`}
                        dataKey={bar.dataKey}
                        fill={bar.fill}
                        stackId={stackId}
                        name={bar.name || bar.dataKey}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default StackedBarChart;