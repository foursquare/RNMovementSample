import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    tint: '#3B82F6',
    icon: '#64748B',
    border: '#E2E8F0',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#3B82F6',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    tint: '#60A5FA',
    icon: '#94A3B8',
    border: '#334155',
    success: '#4ADE80',
    danger: '#F87171',
    warning: '#FBBF24',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#60A5FA',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
