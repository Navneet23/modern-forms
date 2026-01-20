import type { FormConfig } from '../types/form';

const STORAGE_KEY = 'modern_forms_configs';

export function generateFormId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function saveFormConfig(config: FormConfig): string {
  const configs = getAllFormConfigs();
  const id = generateFormId();
  configs[id] = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  return id;
}

export function getFormConfig(id: string): FormConfig | null {
  const configs = getAllFormConfigs();
  return configs[id] || null;
}

export function getAllFormConfigs(): { [id: string]: FormConfig } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function deleteFormConfig(id: string): void {
  const configs = getAllFormConfigs();
  delete configs[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function updateFormConfig(id: string, updates: Partial<FormConfig>): void {
  const configs = getAllFormConfigs();
  if (configs[id]) {
    configs[id] = { ...configs[id], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  }
}
