// components/admin/AdminTabs.tsx

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface AdminTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function AdminTabs({ tabs, activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 transition-colors text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#1e5a96] text-[#1e5a96]'
                : 'border-transparent text-neutral-700 hover:text-neutral-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
