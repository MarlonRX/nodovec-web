import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  children,
  className = '',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={`${className} rounded-xl p-7 shadow-md transition-all ${
        isDragging ? 'shadow-2xl scale-[1.02]' : 'hover:shadow-lg'
      }`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--border-primary)',
        ...style,
      }}
      {...attributes}
      {...listeners}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-xl font-bold cursor-move select-none"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
        <div
          className="w-2 h-2 rounded-full opacity-40 cursor-move"
          style={{ backgroundColor: 'var(--text-secondary)' }}
        />
      </div>
      {children}
    </div>
  );
};