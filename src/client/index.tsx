/**
 * Client entry for the rabbit skin.
 *
 * Wire-up only: styles, dictionaries, the skin controller, and two slot rows.
 * Everything the skin paints lives in skin.ts / palette.ts / skin.css.
 */
import { NS, mountStyles, startSkin, type ThemeLike } from './skin';
import { en, zh } from './strings';
import { RabbitSkinRow, RabbitWeightSlider, type SlotProps } from './ui';

type Disposer = () => void;

interface SlotsLike {
  /** Wait for a slot's provider, then register into it. */
  inject(name: string, factory: () => Disposer): Disposer;
  register(
    config: { name: string; id: string; order?: number; locale?: string },
    component: (props: SlotProps) => unknown,
  ): Disposer;
}

interface LocaleLike {
  register(ns: string, dictionaries: Record<string, Record<string, string>>): Disposer;
}

interface ClientContext {
  theme: ThemeLike;
  slots: SlotsLike;
  locale: LocaleLike;
  effect(setup: () => Disposer | void, label?: string): void;
}

/** Services this plugin waits for before `apply` runs. */
export const inject = ['theme', 'slots', 'locale'];

export function apply(ctx: ClientContext): void {
  ctx.effect(() => mountStyles(), 'rabbit-skin: styles');
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'rabbit-skin: dictionaries');
  ctx.effect(() => startSkin(ctx.theme), 'rabbit-skin: skin');
  ctx.effect(
    () =>
      ctx.slots.inject('settings.general.item', () =>
        ctx.slots.register({ name: 'settings.general.item', id: 'rabbit-skin', order: 12, locale: NS }, RabbitSkinRow),
      ),
    'rabbit-skin: settings row',
  );
  ctx.effect(
    () =>
      ctx.slots.inject('conversation.input.right', () =>
        ctx.slots.register(
          { name: 'conversation.input.right', id: 'rabbit-skin-weight', order: 60, locale: NS },
          RabbitWeightSlider,
        ),
      ),
    'rabbit-skin: composer control',
  );
}
