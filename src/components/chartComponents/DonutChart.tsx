import React, { lazy, Suspense } from "react";

import { PieChartProps } from "./types";

interface DonutChartProps extends PieChartProps {
    colors: string[];
}

const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
        const entry = payload[0];
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
                <p style={{ margin: 0, fontWeight: 600 }}>{entry.name}</p>
                <p style={{ margin: "4px 0", color: entry.fill }}>
                    {entry.value}%
                </p>
            </div>
        );
    }
    return null;
};

// Lazy-load the whole chart as a single unit so recharts' primitives stay
// direct children of each other (Pie must see its Cell children directly).
const DonutChartImpl = lazy(async () => {
    const {
        PieChart,
        Pie,
        Cell,
        Legend,
        Tooltip,
        ResponsiveContainer,
    } = await import("recharts");

    const Chart: React.FC<DonutChartProps> = ({
        data,
        colors,
        innerRadius = 50,
        outerRadius = 80,
        paddingAngle = 2,
        height = 300,
        showLegend = true,
        showTooltip = true,
    }) => {
        return (
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={paddingAngle}
                        dataKey="value"
                        label={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={colors[index % colors.length]}
                            />
                        ))}
                    </Pie>
                    {showTooltip && (
                        <Tooltip content={<CustomTooltip />} />
                    )}
                    {showLegend && (
                        <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                    )}
                </PieChart>
            </ResponsiveContainer>
        );
    };

    return { default: Chart };
});

const DonutChart: React.FC<DonutChartProps> = (props) => (
    <Suspense fallback={<div style={{ width: "100%", height: `${props.height ?? 300}px` }} />}>
        <DonutChartImpl {...props} />
    </Suspense>
);

export default DonutChart;
