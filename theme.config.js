import warmPalette from './themes/palette-warm.json';
import coolPalette from './themes/palette-cool.json';
import darkPalette from './themes/palette-dark.json';

// Change this to switch between themes
export const ACTIVE_THEME = 'dark';

const themes = {
  warm: warmPalette,
  cool: coolPalette,
  dark: darkPalette
};

export const currentTheme = themes[ACTIVE_THEME];
export const colors = currentTheme.colors;