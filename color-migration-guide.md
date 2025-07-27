# Color Migration Guide

## Color Replacements

### Background Colors
- `bg-zinc-900` → `bg-surface-dark` or `bg-[var(--color-bg)]`
- `bg-zinc-800` → `bg-surface` or `bg-[var(--color-surface)]`
- `bg-zinc-700` → `bg-surface-light` or `bg-[var(--color-surface-light)]`
- `bg-black` → `bg-[var(--color-bg-dark)]`
- `bg-gray-900` → `bg-surface-dark`
- `bg-gray-800` → `bg-surface`

### Text Colors
- `text-white` → `text-primary` or `text-[var(--color-text-primary)]`
- `text-gray-300` → `text-secondary` or `text-[var(--color-text-secondary)]`
- `text-gray-400` → `text-muted` or `text-[var(--color-text-muted)]`
- `text-gray-500` → `text-muted`
- `text-gray-600` → `text-muted`

### Accent Colors (replace bright Tailwind colors)
- `bg-blue-600` → `bg-accent-blue` or `bg-[var(--color-accent-blue)]`
- `bg-green-500` → `bg-accent-green` or `bg-[var(--color-accent-green)]`
- `bg-red-500` → `bg-accent-red` or `bg-[var(--color-accent-red)]`
- `bg-yellow-500` → `bg-accent-yellow` or `bg-[var(--color-accent-yellow)]`
- `bg-purple-600` → `bg-accent-purple` or `bg-[var(--color-accent-purple)]`

### Border Colors
- `border-zinc-700` → `border-neutral` or `border-[var(--color-neutral)]`
- `border-zinc-600` → `border-[var(--color-neutral-300)]`
- `border-gray-700` → `border-neutral`

### Gradients (replace colorful gradients)
- `bg-gradient-to-br from-blue-600 to-purple-700` → `gradient-primary`
- Any bright gradient → Use `gradient-surface` or `gradient-subtle`

## How to Use

1. Replace hardcoded colors with CSS variables
2. Use the custom utility classes defined in theme.css
3. For dynamic theme switching, add `data-theme="cool"` to the root element

## Theme Switching

### Available Themes
1. **Dark Professional** (default) - Very dark blacks and olives, ultra-professional
2. **Warm Earth Tones** - Browns and warm grays, vintage audio aesthetic
3. **Cool Natural Tones** - Greens and cool grays, modern studio aesthetic

### How to Switch Themes

#### Static (in code):
Change `ACTIVE_THEME` in `theme.config.js`:
```javascript
export const ACTIVE_THEME = 'dark'; // 'warm', 'cool', or 'dark'
```

#### Dynamic (runtime):
```javascript
// Set theme
document.documentElement.setAttribute('data-theme', 'warm');
document.documentElement.setAttribute('data-theme', 'cool');

// Use default dark theme
document.documentElement.removeAttribute('data-theme');
```

### Theme Characteristics
- **Dark Theme**: Ultra-dark backgrounds (#101716), muted olive primary (#282B1E), very subtle accent colors
- **Warm Theme**: Rich browns (#745B37), warm grays, higher contrast accents
- **Cool Theme**: Natural greens (#8A8767), cool grays, balanced contrast