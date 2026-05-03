import React, { useState } from 'react';
import { Settings, Eye, EyeOff, RotateCcw, LayoutGrid } from 'lucide-react';
import { translate, getCurrentLanguage, type Language } from '../../i18n';
import type { DashboardLayout, WidgetConfig } from '../../types/dashboardInterfaces';
import {
  toggleWidgetVisibility,
  resetToDefault,
  applyPreset,
} from '../../lib/dashboardLayout';

interface DashboardCustomizerProps {
  layout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
}

const WIDGET_LABELS: Record<string, string> = {
  'metric-cards': 'dashboardCustomizer.widgetMetricCards',
  'financial-overview': 'dashboardCustomizer.widgetFinancialOverview',
  'expense-categories': 'dashboardCustomizer.widgetExpenseCategories',
  'account-balances': 'dashboardCustomizer.widgetAccountBalances',
  'recent-transactions': 'dashboardCustomizer.widgetRecentTransactions',
  'budget-progress': 'dashboardCustomizer.widgetBudgetProgress',
  'savings-goals': 'dashboardCustomizer.widgetSavingsGoals',
  'card-summary': 'dashboardCustomizer.widgetCardSummary',
};

type PresetKey = 'default' | 'minimal' | 'analytics';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'default', label: 'dashboardCustomizer.presetDefault' },
  { key: 'minimal', label: 'dashboardCustomizer.presetMinimal' },
  { key: 'analytics', label: 'dashboardCustomizer.presetAnalytics' },
];

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  layout,
  onLayoutChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  React.useEffect(() => {
    const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLangChange);
    return () => window.removeEventListener('languageChanged', onLangChange);
  }, []);

  const handleToggleWidget = (widgetId: string) => {
    const newLayout = toggleWidgetVisibility(layout, widgetId);
    onLayoutChange(newLayout);
  };

  const handleReset = () => {
    const newLayout = resetToDefault();
    onLayoutChange(newLayout);
  };

  const handlePreset = (preset: PresetKey) => {
    const newLayout = applyPreset(preset);
    onLayoutChange(newLayout);
  };

  const sortedWidgets = [...layout.widgets].sort((a, b) => a.order - b.order);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
        style={{
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)',
        }}
        title={t('dashboard.customizeLayout')}
      >
        <LayoutGrid size={18} />
        <span className="hidden sm:inline">{t('dashboard.customize')}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-xl p-6 shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('dashboard.customizeDashboard')}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <h3
                className="text-sm font-semibold mb-3 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('dashboard.widgets')}
              </h3>
              <div className="space-y-2">
                {sortedWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-secondary)',
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t(WIDGET_LABELS[widget.type] || widget.type)}
                    </span>
                    <button
                      onClick={() => handleToggleWidget(widget.id)}
                      className="p-2 rounded-lg transition-all hover:opacity-70"
                      style={{
                        backgroundColor: widget.visible
                          ? 'rgba(var(--accent-primary-rgb), 0.125)'
                          : 'var(--bg-secondary)',
                        color: widget.visible
                          ? 'var(--accent-primary)'
                          : 'var(--text-secondary)',
                      }}
                      title={widget.visible ? t('common.hide') : t('common.show')}
                    >
                      {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3
                className="text-sm font-semibold mb-3 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('dashboard.presets')}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePreset(preset.key)}
                    className="p-3 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style={{
                      backgroundColor:
                        layout.preset === preset.key
                          ? 'var(--accent-primary)'
                          : 'var(--bg-primary)',
                      color:
                        layout.preset === preset.key
                          ? 'var(--text-inverted)'
                          : 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {t(preset.label)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <RotateCcw size={16} />
              {t('dashboard.resetLayout')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};