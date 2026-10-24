/**
 * Skin state and the two things a skin actually does: paint a token layer and
 * put a picture behind the document.
 *
 * State lives outside React in a tiny store so the settings row and the
 * composer control stay in step without either owning the other, and so the
 * controller can repaint from a plain subscription.
 */
import { DEFAULT_STAGE, stageAt, stageIndex } from './art';
import { TOKEN_LAYER } from './palette';
import skinCss from './skin.css';

/** Package id — also the patch id's subject and the token layer's source. */
export const PACKAGE_ID = 'dsh-rabbit-skin';

/** Locale namespace for every string this plugin ships. */
export const NS = PACKAGE_ID;

/** Id of the fixed art element parked behind the document. */
const ART_LAYER_ID = `${PACKAGE_ID}-art`;

/** Body attribute that switches the whole skin on in CSS. */
const SKIN_ATTRIBUTE = 'data-rabbit-skin';

/** Namespaced key; a bare `skin` key would collide with other plugins. */
const STORAGE_KEY = `${PACKAGE_ID}:prefs`;

export interface RabbitPrefs {
  /** Whether the skin is painted at all. */
  readonly enabled: boolean;
  /** Index into `RABBIT_STAGES`. */
  readonly stage: number;
}

const DEFAULT_PREFS: RabbitPrefs = { enabled: true, stage: DEFAULT_STAGE };

function readPrefs(): RabbitPrefs {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) return DEFAULT_PREFS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFS;
    const record = parsed as { enabled?: unknown; stage?: unknown };
    return {
      enabled: typeof record.enabled === 'boolean' ? record.enabled : DEFAULT_PREFS.enabled,
      stage: stageIndex(record.stage),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(prefs: RabbitPrefs): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // A full or disabled localStorage must never break the skin; the value
    // simply does not survive a reload.
  }
}

let prefs: RabbitPrefs = readPrefs();
const listeners = new Set<() => void>();

/** Current preferences — a stable reference until something changes. */
export function getPrefs(): RabbitPrefs {
  return prefs;
}

/** Subscribe to preference changes; returns the unsubscribe function. */
export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Merge a patch, persist it, and notify. No-ops when nothing actually changed. */
export function updatePrefs(patch: Partial<RabbitPrefs>): void {
  const next: RabbitPrefs = {
    enabled: patch.enabled ?? prefs.enabled,
    stage: stageIndex(patch.stage ?? prefs.stage),
  };
  if (next.enabled === prefs.enabled && next.stage === prefs.stage) return;
  prefs = next;
  writePrefs(next);
  for (const listener of [...listeners]) listener();
}

/** Inject the skin stylesheet once; returns a disposer that removes it. */
export function mountStyles(): () => void {
  if (typeof document === 'undefined') return () => {};
  const id = `${PACKAGE_ID}/skin.css`;
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(id)}]`) !== null) return () => {};
  const tag = document.createElement('style');
  tag.dataset.plugin = PACKAGE_ID;
  tag.dataset.pluginCss = id;
  tag.textContent = skinCss;
  document.head.appendChild(tag);
  return () => {
    tag.remove();
  };
}

function artLayer(): HTMLElement | undefined {
  if (typeof document === 'undefined') return undefined;
  const found = document.getElementById(ART_LAYER_ID);
  if (found !== null) return found;
  const element = document.createElement('div');
  element.id = ART_LAYER_ID;
  element.setAttribute('aria-hidden', 'true');
  for (const part of ['rabbit-ambient', 'rabbit-figure', 'rabbit-veil']) {
    const layer = document.createElement('div');
    layer.className = part;
    element.appendChild(layer);
  }
  document.body.prepend(element);
  return element;
}

function paintArt(): void {
  if (typeof document === 'undefined') return;
  const body = document.body;
  if (!prefs.enabled) {
    body.removeAttribute(SKIN_ATTRIBUTE);
    // Drop the layer rather than just hiding it: the inline background carries
    // the full frame, and a switched-off skin has no reason to keep it around.
    document.getElementById(ART_LAYER_ID)?.remove();
    return;
  }
  const element = artLayer();
  if (element === undefined) return;
  const stage = stageAt(prefs.stage);
  // Handed over as a custom property so each painted layer can frame the same
  // photograph its own way: a blurred fill, a sharp figure, a warm veil.
  element.style.setProperty('--rabbit-frame', `url("${stage.art}")`);
  element.dataset.stage = stage.id;
  body.setAttribute(SKIN_ATTRIBUTE, 'on');
}

function unpaintArt(): void {
  if (typeof document === 'undefined') return;
  document.body.removeAttribute(SKIN_ATTRIBUTE);
  document.getElementById(ART_LAYER_ID)?.remove();
}

/** The slice of the theme service this skin touches. */
export interface ThemeLike {
  overrideTokens(source: string, tokens: Record<string, { light: string; dark: string }>): () => void;
}

/**
 * Wire preferences to the document: a token layer while the skin is on, the
 * art element behind everything, and the body attribute that gates both.
 *
 * @param theme - the client theme service.
 * @returns disposer restoring the document to its unskinned state.
 */
export function startSkin(theme: ThemeLike): () => void {
  let disposeTokens: (() => void) | undefined;
  let painted = false;

  const apply = () => {
    if (prefs.enabled !== painted) {
      disposeTokens?.();
      disposeTokens = undefined;
      painted = prefs.enabled;
      if (prefs.enabled) disposeTokens = theme.overrideTokens(PACKAGE_ID, TOKEN_LAYER);
    }
    paintArt();
  };

  apply();
  const unsubscribe = subscribePrefs(apply);
  return () => {
    unsubscribe();
    disposeTokens?.();
    disposeTokens = undefined;
    unpaintArt();
  };
}
