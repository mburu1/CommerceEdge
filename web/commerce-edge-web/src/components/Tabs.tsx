import type React from 'react';

interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function Tabs({ tabs, activeTab, onChange, className = '', variant = 'default' }: TabsProps) {
  const variantClasses = {
    default: 'border-b border-border',
    pills: '',
    underline: 'border-b border-transparent',
  };

  const tabClasses = {
    default: 'border-b-2 border-transparent hover:border-primary/50',
    pills: 'rounded-md',
    underline: 'border-b-2 border-transparent',
  };

  const activeClasses = {
    default: 'border-primary text-primary',
    pills: 'bg-primary text-white',
    underline: 'border-primary text-primary',
  };

  const inactiveClasses = {
    default: 'text-secondary hover:text-primary',
    pills: 'text-secondary hover:bg-background',
    underline: 'text-secondary hover:text-primary',
  };

  return (
    <div className={className} role="tablist" aria-label="Tabs">
      <div className={`flex gap-1 ${variantClasses[variant]}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-trigger`}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? activeClasses[variant] : inactiveClasses[variant]
            } ${tabClasses[variant]} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className = '' }: TabPanelProps) {
  if (activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`${id}-panel`}
      aria-labelledby={`${id}-trigger`}
      className={`mt-4 ${className}`}
    >
      {children}
    </div>
  );
}