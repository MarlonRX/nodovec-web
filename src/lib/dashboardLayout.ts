import type { DashboardLayout, WidgetConfig } from '../types/dashboardInterfaces';
import { DEFAULT_WIDGETS, DASHBOARD_PRESETS } from '../types/dashboardInterfaces';
import { STORAGE_CONFIG } from '../config/api';

const LAYOUT_KEY = `${STORAGE_CONFIG.PREFIX}dashboard_layout`;

export function getStoredLayout(): DashboardLayout {
  if (typeof window === 'undefined') {
    return { version: 1, widgets: DEFAULT_WIDGETS };
  }

  try {
    const stored = localStorage.getItem(LAYOUT_KEY);
    if (stored) {
      return JSON.parse(stored) as DashboardLayout;
    }
  } catch {
    // Ignore parse errors
  }

  return { version: 1, widgets: DEFAULT_WIDGETS };
}

export function saveLayout(layout: DashboardLayout): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    // Ignore storage errors
  }
}

export function resetToDefault(): DashboardLayout {
  const defaultLayout: DashboardLayout = { version: 1, widgets: DEFAULT_WIDGETS };
  saveLayout(defaultLayout);
  return defaultLayout;
}

export function applyPreset(presetName: keyof typeof DASHBOARD_PRESETS): DashboardLayout {
  const presetWidgets = DASHBOARD_PRESETS[presetName];
  if (!presetWidgets) {
    return resetToDefault();
  }

  const layout: DashboardLayout = {
    version: 1,
    widgets: presetWidgets.map((w, idx) => ({ ...w, order: idx })),
    preset: presetName,
  };

  saveLayout(layout);
  return layout;
}

export function toggleWidgetVisibility(
  layout: DashboardLayout,
  widgetId: string
): DashboardLayout {
  const updatedWidgets = layout.widgets.map((w) =>
    w.id === widgetId ? { ...w, visible: !w.visible } : w
  );

  const newLayout = { ...layout, widgets: updatedWidgets };
  saveLayout(newLayout);
  return newLayout;
}

export function reorderWidgets(
  layout: DashboardLayout,
  newOrder: WidgetConfig[]
): DashboardLayout {
  const reorderedWidgets = newOrder.map((w, idx) => ({ ...w, order: idx }));
  const newLayout = { ...layout, widgets: reorderedWidgets };
  saveLayout(newLayout);
  return newLayout;
}

export function getVisibleWidgets(layout: DashboardLayout): WidgetConfig[] {
  return layout.widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);
}