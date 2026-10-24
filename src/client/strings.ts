/**
 * Every string the skin shows, in one place.
 *
 * The host binds `t` to the namespace a slot registration declares, so these
 * dictionaries are what the settings row and the composer control render. The
 * components also fall back to the Chinese dictionary directly: a slot that
 * fails to bind `t` should show Chinese, not raw keys.
 */

export type Dictionary = Record<string, string>;

export const zh: Dictionary = {
  'skin.title': '兔子皮肤',
  'skin.description': '木屋的白兔站在窗口右下角，拖动滑块喂胖它。',
  'stage.group': '兔子体重',
  'stage.slim': '清瘦',
  'stage.normal': '标准',
  'stage.plump': '微胖',
  'stage.round': '圆润',
  'stage.blimp': '膨胀',
  'composer.hint': '兔子体重：{label}，拖动滑块调整',
  'composer.label': '体重',
};

export const en: Dictionary = {
  'skin.title': 'Rabbit skin',
  'skin.description': 'A white rabbit stands in the corner of your workspace. Drag the weight.',
  'stage.group': 'Rabbit weight',
  'stage.slim': 'Lean',
  'stage.normal': 'Normal',
  'stage.plump': 'Plump',
  'stage.round': 'Round',
  'stage.blimp': 'Blimp',
  'composer.hint': 'Rabbit weight: {label} — drag to feed it',
  'composer.label': 'Weight',
};

/** Look up a key and fill `{name}` placeholders; unknown keys fall back to the key. */
export function translate(dict: Dictionary, key: string, params?: Record<string, unknown>): string {
  const template = dict[key] ?? key;
  if (params === undefined) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}
