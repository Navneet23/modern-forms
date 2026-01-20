import type { ThemeConfig } from '../../types/theme';
import { presetThemes } from '../../data/themes';

interface ThemeSelectorProps {
  selectedThemeId: string;
  onSelectTheme: (theme: ThemeConfig) => void;
}

export function ThemeSelector({ selectedThemeId, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Themes</h3>
      <div className="grid grid-cols-2 gap-2">
        {presetThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme)}
            className={`
              relative p-2 rounded-lg border-2 transition-all text-left
              ${selectedThemeId === theme.id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            aria-pressed={selectedThemeId === theme.id}
            title={theme.description}
          >
            {/* Theme preview mini card */}
            <div
              className="h-12 rounded-md mb-1.5 flex items-end p-1.5 overflow-hidden"
              style={{ backgroundColor: theme.colors.background }}
            >
              <div
                className="w-full h-6 rounded"
                style={{ backgroundColor: theme.colors.surface }}
              >
                <div
                  className="h-1.5 w-8 rounded-full mt-1 ml-1"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="h-1 w-6 rounded-full mt-0.5 ml-1"
                  style={{ backgroundColor: theme.colors.textSecondary, opacity: 0.5 }}
                />
              </div>
            </div>

            {/* Theme name */}
            <p className="text-xs font-medium text-gray-800 truncate">{theme.name}</p>

            {/* Selected indicator */}
            {selectedThemeId === theme.id && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
