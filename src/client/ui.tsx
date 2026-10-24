/**
 * The skin's two visible controls.
 *
 * Both read the same store, so dragging the weight in the composer moves the
 * slider in Settings and vice versa. Neither keeps state of its own.
 */
import { useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import { RABBIT_STAGES, stageAt } from './art';
import { getPrefs, subscribePrefs, updatePrefs } from './skin';
import { translate, zh } from './strings';

/** Slot-provided translate function (namespace bound by the registration). */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

/** Props the host slots hand to a row component. */
export interface SlotProps {
  t?: Translate;
}

const LAST_STAGE = RABBIT_STAGES.length - 1;

/**
 * Use the host's translator, or a local one over the Chinese dictionary.
 * A slot that fails to bind `t` should still render words, not keys.
 */
function useTranslate(props: SlotProps): Translate {
  return props.t ?? ((key, params) => translate(zh, key, params));
}

function usePrefs() {
  return useSyncExternalStore(subscribePrefs, getPrefs, getPrefs);
}

/** The filled part of the rail, as a percentage of its width. */
function sliderStyle(index: number): CSSProperties {
  return {
    '--rabbit-progress': `${LAST_STAGE === 0 ? 0 : (index / LAST_STAGE) * 100}%`,
  } as CSSProperties;
}

/** Settings → General row: the on/off switch and the weight slider. */
export function RabbitSkinRow(props: SlotProps) {
  const t = useTranslate(props);
  const prefs = usePrefs();
  const stage = stageAt(prefs.stage);
  return (
    <div className="rabbit-row">
      <div className="rabbit-row__head">
        <div className="rabbit-row__copy">
          <div className="rabbit-row__title">{t('skin.title')}</div>
          <div className="rabbit-row__desc">{t('skin.description')}</div>
        </div>
        <Switch
          checked={prefs.enabled}
          label={t('skin.title')}
          onChange={(next) => {
            updatePrefs({ enabled: next });
          }}
        />
      </div>
      {prefs.enabled ? (
        <div className="rabbit-row__picker">
          <span
            className="rabbit-row__preview"
            aria-hidden="true"
            style={{ backgroundImage: `url("${stage.art}")` }}
          />
          <div className="rabbit-slider">
            <input
              type="range"
              className="rabbit-slider__input"
              min={0}
              max={LAST_STAGE}
              step={1}
              value={prefs.stage}
              aria-label={t('stage.group')}
              aria-valuetext={t(`stage.${stage.id}`)}
              style={sliderStyle(prefs.stage)}
              onChange={(event) => {
                updatePrefs({ stage: Number(event.currentTarget.value) });
              }}
            />
            <div className="rabbit-slider__scale" aria-hidden="true">
              {RABBIT_STAGES.map((item, index) => (
                <span key={item.id} className="rabbit-slider__tick" data-active={index === prefs.stage}>
                  {t(`stage.${item.id}`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Composer right slot: the same weight slider, folded down to one line. */
export function RabbitWeightSlider(props: SlotProps) {
  const t = useTranslate(props);
  const prefs = usePrefs();
  if (!prefs.enabled) return null;
  const stage = stageAt(prefs.stage);
  const label = t(`stage.${stage.id}`);
  return (
    <div className="rabbit-weight" title={t('composer.hint', { label })}>
      <span className="rabbit-weight__label" aria-hidden="true">
        {t('composer.label')}
      </span>
      <input
        type="range"
        className="rabbit-weight__slider"
        min={0}
        max={LAST_STAGE}
        step={1}
        value={prefs.stage}
        aria-label={t('stage.group')}
        aria-valuetext={label}
        style={sliderStyle(prefs.stage)}
        onChange={(event) => {
          updatePrefs({ stage: Number(event.currentTarget.value) });
        }}
      />
    </div>
  );
}
