/**
 * The skin's token layer.
 *
 * Every entry is an alias-layer override for the design tokens the shipped
 * theme publishes, plus a few `--rabbit-*` variables the skin's own stylesheet
 * reads. The theme service picks the value for the active color scheme, so a
 * user who switches light/dark keeps the same skin with a matching palette —
 * the skin never takes over the light/dark preference itself.
 *
 * Both palettes are derived from the artwork: dark walnut planks, cream fur,
 * dusty rose nose, steel-blue eyes.
 */

export interface ModePair {
  light: string;
  dark: string;
}

/** `{ '--dsw-x': { light, dark } }` — the exact shape `theme.overrideTokens` validates. */
export type TokenLayer = Record<string, ModePair>;

const pair = (light: string, dark: string): ModePair => ({ light, dark });

export const TOKEN_LAYER: TokenLayer = {
  // ---- surfaces -----------------------------------------------------------
  // Translucent on purpose: the framed rabbit sits behind the document, so the
  // panes read as warm paper laid over the photograph.
  // The page canvas is the one surface that must stay see-through: everything
  // else (panels, sidebar, bubbles) opts into its own fill, so this is what
  // lets the room the rabbit stands in actually reach the screen.
  '--dsw-alias-bg-base': pair('rgba(250, 244, 235, 0.18)', 'rgba(26, 19, 14, 0.30)'),
  '--dsw-alias-bg-layer-1': pair('rgba(255, 251, 244, 0.90)', 'rgba(44, 32, 25, 0.88)'),
  '--dsw-alias-bg-layer-2': pair('rgba(255, 252, 246, 0.94)', 'rgba(52, 38, 30, 0.92)'),
  '--dsw-alias-bg-layer-3': pair('rgba(255, 253, 249, 0.97)', 'rgba(60, 45, 35, 0.95)'),
  '--dsw-alias-bg-overlay': pair('rgba(48, 33, 22, 0.40)', 'rgba(8, 5, 3, 0.62)'),
  '--dsw-alias-bg-module-platform': pair('rgba(255, 250, 242, 0.92)', 'rgba(40, 30, 24, 0.92)'),
  '--dsw-alias-bg-skeleton': pair('rgba(120, 88, 58, 0.10)', 'rgba(240, 214, 190, 0.10)'),
  '--dsw-alias-bg-multi-select': pair('rgba(176, 106, 82, 0.14)', 'rgba(227, 161, 137, 0.18)'),
  '--dsw-alias-settings-card-fill': pair('rgba(255, 251, 244, 0.88)', 'rgba(48, 35, 27, 0.88)'),
  '--dsw-alias-settings-card-stroke': pair('rgba(96, 68, 48, 0.18)', 'rgba(244, 226, 208, 0.16)'),

  // ---- sidebar ------------------------------------------------------------
  '--dsw-specific-sidebar-fill': pair('rgba(243, 230, 214, 0.68)', 'rgba(24, 17, 13, 0.72)'),
  '--dsw-specific-sidebar-nav-item-hover': pair('rgba(120, 84, 54, 0.10)', 'rgba(246, 216, 186, 0.08)'),
  '--dsw-specific-sidebar-nav-item-active': pair('rgba(120, 84, 54, 0.16)', 'rgba(246, 216, 186, 0.14)'),
  '--dsw-specific-sidebar-nav-item-active-accent': pair('rgba(176, 106, 82, 0.22)', 'rgba(227, 161, 137, 0.26)'),

  // ---- text ---------------------------------------------------------------
  '--dsw-alias-label-primary': pair('#34251c', '#f8eee3'),
  '--dsw-alias-label-primary-dimmed': pair('#5e4838', '#dcc7b3'),
  '--dsw-alias-label-secondary': pair('#5d4739', '#dcc9b6'),
  '--dsw-alias-label-tertiary': pair('#8a7462', '#b6a08b'),
  '--dsw-alias-label-caption': pair('#9c8773', '#a08b76'),
  '--dsw-alias-label-dimmed': pair('#ad9a87', '#8c7764'),
  '--dsw-alias-label-inverted': pair('#fdf7ef', '#2a1d15'),
  '--dsw-alias-link': pair('#a4553c', '#eda98f'),

  // ---- lines --------------------------------------------------------------
  '--dsw-alias-border-l1': pair('rgba(96, 68, 48, 0.12)', 'rgba(244, 226, 208, 0.10)'),
  '--dsw-alias-border-l2': pair('rgba(96, 68, 48, 0.20)', 'rgba(244, 226, 208, 0.18)'),
  '--dsw-alias-border-l2-darkmode-thin': pair('rgba(96, 68, 48, 0.20)', 'rgba(244, 226, 208, 0.14)'),
  '--dsw-alias-border-l3': pair('rgba(96, 68, 48, 0.28)', 'rgba(244, 226, 208, 0.26)'),
  '--dsw-alias-border-l4': pair('rgba(96, 68, 48, 0.38)', 'rgba(244, 226, 208, 0.36)'),
  '--dsw-alias-border-inverted': pair('rgba(255, 251, 244, 0.22)', 'rgba(20, 14, 10, 0.24)'),
  '--dsw-alias-border-inverted2': pair('rgba(255, 251, 244, 0.14)', 'rgba(20, 14, 10, 0.16)'),

  // ---- accent -------------------------------------------------------------
  '--dsw-alias-brand-primary': pair('#b06a52', '#e3a189'),
  '--dsw-alias-brand-text': pair('#8f4f39', '#f0b79f'),
  '--dsw-alias-button-primary-fill': pair('#b0694f', '#c9765c'),
  '--dsw-alias-button-primary-hover': pair('#9c5942', '#d98a70'),
  '--dsw-alias-interactive-bg-hover': pair('rgba(150, 110, 80, 0.12)', 'rgba(246, 216, 186, 0.08)'),
  '--dsw-alias-interactive-bg-active': pair('rgba(150, 110, 80, 0.18)', 'rgba(246, 216, 186, 0.14)'),
  '--dsw-alias-interactive-bg-hover-solid': pair('#f0e1d0', '#4a3729'),
  '--dsw-alias-interactive-bg-hover-accent': pair('rgba(176, 106, 82, 0.14)', 'rgba(227, 161, 137, 0.18)'),
  '--dsw-focus-ring-color': pair('rgba(176, 106, 82, 0.55)', 'rgba(227, 161, 137, 0.60)'),

  // ---- components ---------------------------------------------------------
  '--dsw-specific-input-major': pair('rgba(255, 251, 245, 0.97)', 'rgba(24, 18, 14, 0.88)'),
  '--dsw-specific-login-input': pair('rgba(255, 251, 245, 0.97)', 'rgba(24, 18, 14, 0.88)'),
  '--dsw-specific-menu': pair('rgba(255, 252, 247, 0.99)', 'rgba(34, 25, 20, 0.99)'),
  '--dsw-menu-surface-fill': pair('rgba(255, 252, 247, 0.99)', 'rgba(34, 25, 20, 0.99)'),
  '--dsw-specific-selector': pair('rgba(255, 251, 244, 0.96)', 'rgba(36, 27, 21, 0.96)'),
  '--dsw-specific-tip': pair('rgba(255, 250, 242, 0.96)', 'rgba(38, 28, 22, 0.96)'),
  '--dsw-specific-bubble': pair('#f2e2cf', '#4a372a'),
  '--dsw-specific-bubble-highlight': pair('#ecd3ba', '#5a4331'),
  '--dsw-alias-switch-thumb': pair('#fffdf9', '#fff8ef'),
  '--dsw-alias-tooltip-bg': pair('#4a3527', '#f4e6d7'),
  '--dsw-alias-tooltip-key-bg': pair('rgba(255, 251, 244, 0.16)', 'rgba(42, 29, 21, 0.12)'),
  '--dsw-alias-toast-bg': pair('#4a3527', '#f4e6d7'),
  '--dsw-alias-toast-label': pair('#fdf6ee', '#2a1d15'),
  '--dsw-alias-button-tool-bar-fill': pair('rgba(255, 250, 242, 0.72)', 'rgba(36, 27, 21, 0.72)'),
  '--dsw-alias-button-tool-bar-hover': pair('rgba(150, 110, 80, 0.16)', 'rgba(246, 216, 186, 0.12)'),
  '--dsw-alias-button-elevated-fill': pair('rgba(255, 252, 247, 0.98)', 'rgba(44, 32, 25, 0.98)'),
  '--dsw-alias-scrollbar-bg-l1': pair('rgba(120, 88, 62, 0.16)', 'rgba(246, 216, 186, 0.14)'),
  '--dsw-alias-scrollbar-bg-l2': pair('rgba(120, 88, 62, 0.10)', 'rgba(246, 216, 186, 0.09)'),
  '--dsw-alias-scrollbar-hover-l1': pair('rgba(120, 88, 62, 0.32)', 'rgba(246, 216, 186, 0.28)'),
  '--dsw-alias-scrollbar-hover-l2': pair('rgba(120, 88, 62, 0.22)', 'rgba(246, 216, 186, 0.20)'),

  // ---- markdown -----------------------------------------------------------
  '--dsw-alias-markdown-code-block': pair('rgba(245, 233, 219, 0.82)', 'rgba(26, 19, 15, 0.86)'),
  '--dsw-alias-markdown-code-block-banner': pair('rgba(238, 222, 203, 0.92)', 'rgba(34, 25, 20, 0.94)'),
  '--dsw-alias-markdown-inline-code': pair('rgba(238, 222, 203, 0.90)', 'rgba(58, 43, 34, 0.90)'),
  '--dsw-alias-markdown-citation': pair('rgba(176, 106, 82, 0.14)', 'rgba(227, 161, 137, 0.18)'),
  '--dsw-alias-markdown-tag': pair('rgba(176, 106, 82, 0.16)', 'rgba(227, 161, 137, 0.20)'),
  '--dsw-alias-markdown-placeholder': pair('#9c8773', '#8c7764'),
  '--dsw-alias-menu-icon': pair('#7a6350', '#c0a992'),
  '--dsw-alias-menu-group-header-fill': pair('rgba(120, 88, 62, 0.06)', 'rgba(246, 216, 186, 0.06)'),

  // ---- skin-owned variables, read by skin.css -----------------------------
  // The artwork is a photograph, so a light filter keeps it from competing
  // with the UI, and the veil pulls the corners down for text contrast. In
  // light mode the wash is heavier: a dark walnut photograph under cream panes
  // would otherwise read as dirty grey.
  '--rabbit-art-filter': pair(
    'saturate(1.04) contrast(1.02) brightness(1.02)',
    'saturate(0.92) contrast(0.99) brightness(0.78)',
  ),
  // Weighted to the left, where the conversation lives: the wash is heaviest
  // under the text column and thins out toward the rabbit in the right corner.
  '--rabbit-veil': pair(
    'radial-gradient(128% 118% at 24% 32%, rgba(252, 248, 241, 0.54) 0%, rgba(250, 243, 232, 0.30) 48%, rgba(243, 230, 212, 0.06) 100%)',
    'radial-gradient(128% 118% at 24% 32%, rgba(10, 7, 5, 0.50) 0%, rgba(12, 8, 6, 0.26) 50%, rgba(8, 5, 3, 0.04) 100%)',
  ),
};
