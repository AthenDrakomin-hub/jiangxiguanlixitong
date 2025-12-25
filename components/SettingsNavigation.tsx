import React from 'react';

interface SettingsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SettingsNavigation: React.FC<SettingsNavigationProps> = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: '常规', label: '常规', icon: '⚙️' },
    { id: '数据库', label: '数据库', icon: '🗄️' },
    { id: '云运维', label: '云运维', icon: '☁️' },
    { id: '安全', label: '安全', icon: '🔒' },
  ];

  return (
    <div className="w-48 flex-shrink-0 border-r border-gray-200 bg-gray-50">
      <nav className="p-4">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SettingsNavigation;