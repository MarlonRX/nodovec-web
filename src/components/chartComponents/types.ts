export interface ChartData {
    [key: string]: string | number;
}

export interface ChartColors {
    [key: string]: string;
}

export interface TooltipConfig {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
}

export interface ChartConfig {
    height?: number;
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    animationDuration?: number;
}

export interface LineChartProps extends ChartConfig {
    data: ChartData[];
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: boolean;
    curveType?: "linear" | "monotone" | "natural";
}

export interface BarChartProps extends ChartConfig {
    data: ChartData[];
    bars: Array<{
        dataKey: string;
        fill: string;
        name?: string;
    }>;
    xAxisKey: string;
}

export interface ComposedChartProps extends ChartConfig {
    data: ChartData[];
    bars?: Array<{
        dataKey: string;
        fill: string;
        name?: string;
    }>;
    lines?: Array<{
        dataKey: string;
        stroke: string;
        strokeWidth?: number;
        name?: string;
    }>;
    xAxisKey: string;
    yAxisDomain?: [number | 'auto', number | 'auto'];
}

export interface PieChartProps extends ChartConfig {
    data: Array<{
        name: string;
        value: number;
    }>;
    colors: string[];
    innerRadius?: number;
    outerRadius?: number;
    paddingAngle?: number;
}

export interface StackedBarChartProps extends ChartConfig {
    data: ChartData[];
    bars: Array<{
        dataKey: string;
        fill: string;
        name?: string;
    }>;
    xAxisKey: string;
    stackId?: string;
}

export interface ProgressBarProps {
    label: string;
    value: number;
    max: number;
    color: string;
    backgroundColor?: string;
    showPercentage?: boolean;
    height?: number;
}

export interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    subtitle?: string;
    chart?: React.ReactNode;
}