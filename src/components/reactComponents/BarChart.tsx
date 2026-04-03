import { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { z } from "zod";
import { translate } from "../../i18n";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

export const defaultOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: "top" as const,
        },
        title: {
            display: true,
        },
    },
    scales: {
        y: {
            ticks: {
                callback: function (value: number) {
                    return `$${value}`;
                },
            },
        },
    },
};

const dataSchema = z.array(z.number().min(0).max(1000));

function generateRandomData(labels: string[], schema: typeof dataSchema) {
    const dataset = labels.map(() => Math.floor(Math.random() * 1001));
    const parsed = schema.safeParse(dataset);
    return parsed.success ? parsed.data : [];
}

export function BarChart({
    labels = translate("months").split(","),
    datasetsConfig,
    options = defaultOptions,
    movement = false,
}: {
    labels?: string[];
    datasetsConfig?: { label: string; backgroundColor: string }[];
    options?: any;
    movement?: boolean;
}) {
    const rootStyles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const defaultDatasets = [
        {
            label: translate("barChart.debts"),
            backgroundColor: (rootStyles?.getPropertyValue('--semantic-success') || '#2E8B57').trim(),
        },
        {
            label: translate("barChart.credits"),
            backgroundColor: (rootStyles?.getPropertyValue('--semantic-error') || '#CF6679').trim(),
        },
    ];
    const effectiveDatasets = datasetsConfig || defaultDatasets;
    const [dynamicData, setDynamicData] = useState({
        labels,
        datasets: datasetsConfig.map((config) => ({
            label: config.label,
            data: generateRandomData(labels, dataSchema),
            backgroundColor: config.backgroundColor,
        })),
    });

    useEffect(() => {
        if (movement) {
            const interval = setInterval(() => {
                setDynamicData({
                    labels,
                    datasets: datasetsConfig.map((config) => ({
                        label: config.label,
                        data: generateRandomData(labels, dataSchema),
                        backgroundColor: config.backgroundColor,
                    })),
                });
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [movement, labels, datasetsConfig]);

    return (
        <div>
            <Bar
                options={options}
                data={
                    movement
                        ? dynamicData
                        : {
                              labels,
                              datasets: datasetsConfig.map((config) => ({
                                  label: config.label,
                                  data: generateRandomData(labels, dataSchema),
                                  backgroundColor: config.backgroundColor,
                              })),
                          }
                }
            />
        </div>
    );
}
