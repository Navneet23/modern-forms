import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { ThemeColors } from '../../types/theme';

interface ColorCustomizerProps {
  colors: ThemeColors;
  onColorChange: (colorKey: keyof ThemeColors, value: string) => void;
}

interface ColorSwatchProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

function ColorSwatch({ label, color, onChange }: ColorSwatchProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div
          className="w-6 h-6 rounded-md border border-gray-300 shadow-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-gray-700 flex-1 text-left">{label}</span>
        <span className="text-xs text-gray-400 font-mono">{color}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Color picker popover - opens upward for better visibility */}
          <div className="absolute left-0 bottom-full mb-1 z-20 bg-white rounded-lg shadow-xl border border-gray-200 p-3">
            <HexColorPicker color={color} onChange={onChange} />
            <input
              type="text"
              value={color}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  onChange(val);
                }
              }}
              className="mt-2 w-full px-2 py-1 text-xs font-mono border border-gray-300 rounded"
              placeholder="#000000"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function ColorCustomizer({ colors, onColorChange }: ColorCustomizerProps) {
  const colorFields: { key: keyof ThemeColors; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'background', label: 'Background' },
    { key: 'surface', label: 'Card/Surface' },
    { key: 'text', label: 'Text' },
    { key: 'textSecondary', label: 'Text Secondary' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Customize Colors</h3>
      <div className="space-y-1">
        {colorFields.map(({ key, label }) => (
          <ColorSwatch
            key={key}
            label={label}
            color={colors[key]}
            onChange={(value) => onColorChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
}
