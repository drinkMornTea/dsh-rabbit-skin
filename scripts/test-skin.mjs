/**
 * Contract test for the built bundle — run with `npm test` after `npm run build`.
 *
 * The skin's failure modes are all about wiring, so this exercises the real
 * bundle with a fake DOM, a fake React, and a fake client context:
 *
 *   - the bundle registers under the package name the profile patch uses;
 *   - `apply` claims the two slots, the locale namespace, and one token layer;
 *   - every token carries a light and a dark value;
 *   - the row renders five stages, and picking one repaints the art layer;
 *   - switching the skin off disposes the token layer and un-paints the document;
 *   - the composer control cycles through the stages and wraps.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const patch = await readFile(join(root, 'cordis.patch.yml'), 'utf8');
const bundle = await readFile(join(root, 'lib', 'client.js'), 'utf8');

// ---- package wiring ------------------------------------------------------
assert.equal(pkg.main, './src/index.js', 'package.json main must point at the host entry');
assert.equal(pkg.exports['./client'], './lib/client.js', 'the client bundle must be exported as ./client');
assert.equal(pkg.dsh?.client?.platform, 'web', 'dsh.client.platform must be "web"');
assert.ok(patch.includes(`name: ${pkg.name}`), 'cordis.patch.yml must insert this package');
for (const id of ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives']) {
  assert.ok(bundle.includes(`require("${id}")`), `${id} must stay external`);
}

// ---- fake DOM ------------------------------------------------------------
function createStyle() {
  const values = new Map();
  return {
    setProperty: (name, value) => values.set(name, String(value)),
    getPropertyValue: (name) => values.get(name) ?? '',
    removeProperty: (name) => values.delete(name),
  };
}

class Element {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.dataset = {};
    this.style = createStyle();
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  getAttribute(name) {
    return this.attributes[name];
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  prepend(child) {
    child.parentNode = this;
    this.children.unshift(child);
    return child;
  }
  remove() {
    if (this.parentNode === null) return;
    const index = this.parentNode.children.indexOf(this);
    if (index >= 0) this.parentNode.children.splice(index, 1);
    this.parentNode = null;
  }
  querySelector() {
    return null;
  }
}

const head = new Element('head');
const body = new Element('body');
const document = {
  head,
  body,
  createElement: (tag) => new Element(tag),
  getElementById: (id) => [...body.children, ...head.children].find((child) => child.id === id) ?? null,
  querySelector: (selector) => {
    const match = /^style\[data-plugin-css="(.+)"\]$/.exec(selector);
    if (match === null) return null;
    return head.children.find((child) => child.dataset.pluginCss === match[1]) ?? null;
  },
};

const storage = new Map();
const localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

// ---- fake React ----------------------------------------------------------
const jsx = (type, props) => ({ type, props: props ?? {} });
const jsxRuntime = { jsx, jsxs: jsx, Fragment: Symbol('Fragment') };

function hookSyncExternalStore(_subscribe, getSnapshot) {
  return getSnapshot();
}

const reactMock = {
  useSyncExternalStore: hookSyncExternalStore,
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useMemo: (factory) => factory(),
  useRef: (value) => ({ current: value }),
};

function Switch(props) {
  return { type: 'switch-stub', props };
}
Switch.__switchStub = true;

const modules = {
  react: reactMock,
  'react/jsx-runtime': jsxRuntime,
  '@deepseek-ai/dsh-client-ui-primitives': { Switch },
};

// ---- load the bundle -----------------------------------------------------
let registered;
const windowStub = {
  __ModuleLoader__: {
    load: (entry) => {
      registered = entry;
    },
  },
};

// The bundle reaches for `globalThis.localStorage`, exactly as it does in the
// shell; install the fake there rather than shadowing it.
globalThis.localStorage = localStorage;

new Function('window', 'require', 'document', bundle)(windowStub, (id) => modules[id], document);

assert.ok(registered !== undefined, 'the bundle must call __ModuleLoader__.load');
assert.equal(registered.id, pkg.name, 'the bundle id must be the package name');

const client = registered.factory((id) => {
  const mod = modules[id];
  assert.ok(mod !== undefined, `unexpected external module: ${id}`);
  return mod;
});

assert.equal(typeof client.apply, 'function', 'the client half must export apply');
assert.deepEqual([...client.inject].sort(), ['locale', 'slots', 'theme'], 'apply must wait for theme, slots and locale');

// ---- fake client context -------------------------------------------------
const disposers = [];
const slotRegistrations = [];
let tokenLayer;
let tokenDisposerCalls = 0;

const context = {
  theme: {
    overrideTokens(source, tokens) {
      assert.equal(source, pkg.name, 'the token layer must be owned by this package');
      tokenLayer = tokens;
      return () => {
        tokenDisposerCalls += 1;
      };
    },
  },
  slots: {
    inject(name, factory) {
      return factory();
    },
    register(config, component) {
      slotRegistrations.push({ config, component });
      return () => {};
    },
  },
  locale: {
    register(namespace, dictionaries) {
      assert.equal(namespace, pkg.name);
      const keys = Object.keys(dictionaries.zh).sort();
      assert.deepEqual(Object.keys(dictionaries.en).sort(), keys, 'both dictionaries must carry the same keys');
      for (const key of keys) assert.equal(typeof dictionaries.zh[key], 'string');
      return () => {};
    },
  },
  effect(setup) {
    const dispose = setup();
    if (typeof dispose === 'function') disposers.push(dispose);
  },
};

client.apply(context);

// ---- what apply claimed --------------------------------------------------
assert.equal(slotRegistrations.length, 2, 'the skin claims exactly two slots');
const slotNames = slotRegistrations.map((row) => `${row.config.name}#${row.config.id}`);
assert.deepEqual(slotNames, ['settings.general.item#rabbit-skin', 'conversation.input.right#rabbit-skin-weight']);

assert.ok(tokenLayer !== undefined, 'the skin must claim a token layer while enabled');
const tokenNames = Object.keys(tokenLayer);
assert.ok(tokenNames.length >= 50, `expected a full palette, got ${tokenNames.length} tokens`);
for (const [name, value] of Object.entries(tokenLayer)) {
  assert.match(name, /^--/, `${name} is not a custom property`);
  assert.equal(typeof value, 'object', `${name} must be a { light, dark } pair`);
  assert.equal(typeof value.light, 'string', `${name} is missing a light value`);
  assert.equal(typeof value.dark, 'string', `${name} is missing a dark value`);
}

assert.equal(body.getAttribute('data-rabbit-skin'), 'on', 'the skin must be on by default');
const art = document.getElementById('dsh-rabbit-skin-art');
assert.ok(art !== undefined && art !== null, 'the art layer must be mounted');
assert.match(
  art.style.getPropertyValue('--rabbit-frame'),
  /^url\("data:image\/webp;base64,[A-Za-z0-9+/=]+"\)$/,
  'the art layer must carry the inline frame',
);
assert.deepEqual(
  art.children.map((child) => child.className),
  ['rabbit-ambient', 'rabbit-figure', 'rabbit-veil'],
  'the art layer must paint ambient, figure and veil, in that order',
);
assert.ok(head.children.some((child) => child.dataset.plugin === pkg.name), 'the stylesheet must be injected');

const dataFrames = bundle.match(/data:image\/webp;base64,/gu)?.length ?? 0;
assert.ok(dataFrames >= 5, `expected five inlined frames, found ${dataFrames}`);

// ---- the settings row ----------------------------------------------------
function textOf(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  const children = node.props?.children;
  const own = typeof node.props?.label === 'string' ? node.props.label : '';
  return own + textOf(children);
}

function findAll(node, predicate, found = []) {
  if (node === null || node === undefined || typeof node !== 'object') return found;
  if (Array.isArray(node)) {
    for (const item of node) findAll(item, predicate, found);
    return found;
  }
  if (predicate(node)) found.push(node);
  findAll(node.props?.children, predicate, found);
  return found;
}

const rowSlot = slotRegistrations.find((row) => row.config.name === 'settings.general.item');
const t = (key, params = {}) =>
  String(params.label ?? key).length > 0 ? `${key}${params.label === undefined ? '' : `:${params.label}`}` : key;

const row = rowSlot.component({ t });
const rowSliders = findAll(row, (node) => node.type === 'input' && node.props?.type === 'range');
assert.equal(rowSliders.length, 1, 'the row must offer one weight slider');
assert.equal(textOf(row).includes('skin.title'), true, 'the row must render its title');
assert.deepEqual(
  {
    min: rowSliders[0].props.min,
    max: rowSliders[0].props.max,
    step: rowSliders[0].props.step,
    value: rowSliders[0].props.value,
  },
  { min: 0, max: 4, step: 1, value: 2 },
  'the slider must span the five stages and start at the default',
);
assert.equal(rowSliders[0].props['aria-valuetext'], 'stage.plump', 'the slider must name its current stage');

const untranslated = rowSlot.component({});
assert.ok(textOf(untranslated).includes('兔子皮肤'), 'the row must fall back to Chinese when no translator is bound');

const switchNode = findAll(row, (node) => node.type === Switch)[0];
assert.ok(switchNode !== undefined, 'the row must render the enable switch');
assert.equal(switchNode.props.checked, true);

// drag to the fattest rabbit
rowSliders[0].props.onChange({ currentTarget: { value: '4' } });
assert.equal(storage.get('dsh-rabbit-skin:prefs'), JSON.stringify({ enabled: true, stage: 4 }));
assert.equal(art.dataset.stage, 'blimp', 'picking a stage must repaint the art layer');
assert.equal(document.getElementById('dsh-rabbit-skin-art'), art, 'repainting must reuse the layer');

// ---- the composer control ------------------------------------------------
const weightSlot = slotRegistrations.find((row) => row.config.name === 'conversation.input.right');
rowSliders[0].props.onChange({ currentTarget: { value: '0' } }); // start from the lean end
const walked = [];
for (let index = 0; index < 5; index += 1) {
  const control = weightSlot.component({ t });
  const slider = findAll(control, (node) => node.type === 'input' && node.props?.type === 'range')[0];
  assert.ok(slider !== undefined, 'the composer control must be a weight slider');
  assert.equal(slider.props.value, index, 'the composer slider must mirror the stored stage');
  walked.push(art.dataset.stage);
  slider.props.onChange({ currentTarget: { value: String((index + 1) % 5) } });
}
assert.deepEqual(
  walked,
  ['slim', 'normal', 'plump', 'round', 'blimp'],
  'dragging the composer slider must walk the whole weight range in order',
);
assert.equal(JSON.parse(storage.get('dsh-rabbit-skin:prefs')).stage, 0, 'the slider must wrap back to the lean end');

// ---- turning the skin off ------------------------------------------------
switchNode.props.onChange(false);
assert.equal(body.getAttribute('data-rabbit-skin'), undefined, 'the body attribute must be cleared');
assert.equal(tokenDisposerCalls, 1, 'the token layer must be disposed');
assert.equal(document.getElementById("dsh-rabbit-skin-art") === null, true, "the art layer must be removed");
assert.equal(weightSlot.component({ t }), null, 'the composer control must hide while the skin is off');
assert.equal(JSON.parse(storage.get('dsh-rabbit-skin:prefs')).enabled, false);

// ---- and on again, then unmount -----------------------------------------
switchNode.props.onChange(true);
assert.equal(body.getAttribute('data-rabbit-skin'), 'on');
assert.ok(document.getElementById('dsh-rabbit-skin-art') !== null);

for (const dispose of disposers.reverse()) dispose();
assert.equal(body.getAttribute('data-rabbit-skin'), undefined, 'disposing must restore the document');

console.log('authored contract test: ok');
