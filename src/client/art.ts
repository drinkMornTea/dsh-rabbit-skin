/**
 * The five painted weight stages, inlined at build time.
 *
 * `assets/*.webp` are 900px wide and 9–16 KB each, so inlining them as data URIs
 * costs less than a hundred kilobytes of bundle and buys a single code path for
 * both carriers: a browser page resolves `/plugins/...` over HTTP, while the
 * desktop shell loads the page from `file://` and would have nothing to resolve
 * it against. Nothing here needs a host route.
 */
import slim from '../../assets/rabbit-1.webp';
import normal from '../../assets/rabbit-2.webp';
import plump from '../../assets/rabbit-3.webp';
import round from '../../assets/rabbit-4.webp';
import blimp from '../../assets/rabbit-5.webp';

export interface RabbitStage {
  /** Stable id — also the locale key suffix and the storage value. */
  readonly id: 'slim' | 'normal' | 'plump' | 'round' | 'blimp';
  /** Inline `data:image/webp;base64,...` frame. */
  readonly art: string;
}

/** Stage order is the slider order: lean at 0, spherical at 4. */
export const RABBIT_STAGES: readonly RabbitStage[] = [
  { id: 'slim', art: slim },
  { id: 'normal', art: normal },
  { id: 'plump', art: plump },
  { id: 'round', art: round },
  { id: 'blimp', art: blimp },
];

/** Stage shown on first install: the compact, unmistakably-rabbit frame. */
export const DEFAULT_STAGE = 2;

/** Clamp an arbitrary index into the stage range. */
export function stageIndex(value: unknown): number {
  const index = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : DEFAULT_STAGE;
  return Math.min(RABBIT_STAGES.length - 1, Math.max(0, index));
}

/** The stage record at a clamped index. */
export function stageAt(index: number): RabbitStage {
  return RABBIT_STAGES[stageIndex(index)]!;
}
