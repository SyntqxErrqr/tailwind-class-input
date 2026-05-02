/**
 * Preset definitions for TailwindClassInput.
 *
 * A PresetGroup can contain flat presets or nested SubSections,
 * each with their own label and preset list.
 */

export interface PresetClass {
  /** The Tailwind class string (may be multi-class for combo presets) */
  value: string;
  /** Short label on the chip/button */
  label: string;
  /** Longer description for tooltip */
  description?: string;
}

export interface PresetSubSection {
  /** Sub-section heading */
  label: string;
  presets: PresetClass[];
}

export interface PresetGroup {
  id: string;
  label: string;
  icon?: string;
  /** Top-level presets (shown before any sub-sections) */
  presets?: PresetClass[];
  /** Nested sub-sections */
  sections?: PresetSubSection[];
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

const COLORS = [
  { label: 'Red',    value: 'red' },
  { label: 'Orange', value: 'orange' },
  { label: 'Amber',  value: 'amber' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Lime',   value: 'lime' },
  { label: 'Green',  value: 'green' },
  { label: 'Teal',   value: 'teal' },
  { label: 'Cyan',   value: 'cyan' },
  { label: 'Blue',   value: 'blue' },
  { label: 'Indigo', value: 'indigo' },
  { label: 'Violet', value: 'violet' },
  { label: 'Purple', value: 'purple' },
  { label: 'Pink',   value: 'pink' },
  { label: 'Rose',   value: 'rose' },
];

const SHADES = [
  { label: '50',  value: '50',  desc: 'Lightest' },
  { label: '100', value: '100', desc: 'Very light' },
  { label: '200', value: '200', desc: 'Light' },
  { label: '300', value: '300', desc: 'Light-medium' },
  { label: '400', value: '400', desc: 'Medium-light' },
  { label: '500', value: '500', desc: 'Medium' },
  { label: '600', value: '600', desc: 'Medium-dark' },
  { label: '700', value: '700', desc: 'Dark' },
  { label: '800', value: '800', desc: 'Very dark' },
  { label: '900', value: '900', desc: 'Darkest' },
];

function colorShadeSection(prefix: string, color: { label: string; value: string }, readableName: string): PresetSubSection {
  return {
    label: `${color.label}`,
    presets: SHADES.map(s => ({
      value: `${prefix}-${color.value}-${s.value}`,
      label: s.label,
      description: `${s.desc} ${readableName} ${color.label} (${color.value}-${s.value})`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Spacing scale
// ---------------------------------------------------------------------------

const ALL_SIDES_PRESETS: PresetClass[] = [
  { value: 'p-0', label: 'None',  description: 'No padding' },
  { value: 'p-1', label: 'XS',   description: 'Extra small — 4px' },
  { value: 'p-2', label: 'SM',   description: 'Small — 8px' },
  { value: 'p-3', label: 'MD-',  description: 'Medium-small — 12px' },
  { value: 'p-4', label: 'MD',   description: 'Medium — 16px' },
  { value: 'p-5', label: 'MD+',  description: 'Medium-large — 20px' },
  { value: 'p-6', label: 'LG',   description: 'Large — 24px' },
  { value: 'p-8', label: 'XL',   description: 'Extra large — 32px' },
  { value: 'p-10',label: '2XL',  description: '2× large — 40px' },
  { value: 'p-12',label: '3XL',  description: '3× large — 48px' },
  { value: 'p-16',label: '4XL',  description: '4× large — 64px' },
];

function makePaddingSide(prefix: 'px' | 'py' | 'pt' | 'pr' | 'pb' | 'pl'): PresetClass[] {
  const labels: Record<string, string> = { px: 'X', py: 'Y', pt: 'T', pr: 'R', pb: 'B', pl: 'L' };
  const names: Record<string, string> = { px: 'Horizontal', py: 'Vertical', pt: 'Top', pr: 'Right', pb: 'Bottom', pl: 'Left' };
  const l = labels[prefix];
  const n = names[prefix];
  return [
    { value: `${prefix}-0`, label: 'None', description: `No ${n.toLowerCase()} padding` },
    { value: `${prefix}-1`, label: 'XS',   description: `${n} padding — 4px` },
    { value: `${prefix}-2`, label: 'SM',   description: `${n} padding — 8px` },
    { value: `${prefix}-3`, label: 'MD-',  description: `${n} padding — 12px` },
    { value: `${prefix}-4`, label: 'MD',   description: `${n} padding — 16px` },
    { value: `${prefix}-6`, label: 'LG',   description: `${n} padding — 24px` },
    { value: `${prefix}-8`, label: 'XL',   description: `${n} padding — 32px` },
    { value: `${prefix}-12`,label: '2XL',  description: `${n} padding — 48px` },
    { value: `${prefix}-16`,label: '3XL',  description: `${n} padding — 64px` },
  ];
}

function makeMarginSide(prefix: 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml'): PresetClass[] {
  const names: Record<string, string> = { mx: 'Horizontal', my: 'Vertical', mt: 'Top', mr: 'Right', mb: 'Bottom', ml: 'Left' };
  const n = names[prefix];
  const extras: PresetClass[] = (prefix === 'mx' || prefix === 'ml' || prefix === 'mr')
    ? [{ value: `${prefix}-auto`, label: 'Auto', description: `Auto ${n.toLowerCase()} margin (center)` }]
    : [];
  return [
    { value: `${prefix}-0`, label: 'None', description: `No ${n.toLowerCase()} margin` },
    { value: `${prefix}-1`, label: 'XS',   description: `${n} margin — 4px` },
    { value: `${prefix}-2`, label: 'SM',   description: `${n} margin — 8px` },
    { value: `${prefix}-3`, label: 'MD-',  description: `${n} margin — 12px` },
    { value: `${prefix}-4`, label: 'MD',   description: `${n} margin — 16px` },
    { value: `${prefix}-6`, label: 'LG',   description: `${n} margin — 24px` },
    { value: `${prefix}-8`, label: 'XL',   description: `${n} margin — 32px` },
    { value: `${prefix}-12`,label: '2XL',  description: `${n} margin — 48px` },
    { value: `${prefix}-16`,label: '3XL',  description: `${n} margin — 64px` },
    ...extras,
  ];
}

// ---------------------------------------------------------------------------
// All preset groups
// ---------------------------------------------------------------------------

export const PRESET_GROUPS: Record<string, PresetGroup> = {

  layout: {
    id: 'layout',
    label: 'Layout',
    icon: '🗂️',
    presets: [
      { value: 'flex',             label: 'Row',        description: 'Flex row — children side by side' },
      { value: 'flex flex-col',    label: 'Column',     description: 'Flex column — children stacked vertically' },
      { value: 'grid',             label: 'Grid',       description: 'Grid layout' },
      { value: 'block',            label: 'Block',      description: 'Full-width block element' },
      { value: 'inline-flex',      label: 'Inline row', description: 'Inline flex — fits content width' },
      { value: 'hidden',           label: 'Hidden',     description: 'Hide the element completely (display: none)' },
      { value: 'flex items-center justify-center',  label: 'Center all',    description: 'Center children horizontally and vertically' },
      { value: 'flex items-center justify-between', label: 'Space between', description: 'Children at each end, space in the middle' },
      { value: 'flex flex-wrap gap-2',              label: 'Wrap + gap',    description: 'Wrapping flex row with a small gap' },
      { value: 'grid grid-cols-2 gap-4',            label: '2 cols',        description: '2-column grid with gap' },
      { value: 'grid grid-cols-3 gap-4',            label: '3 cols',        description: '3-column grid with gap' },
      { value: 'grid grid-cols-4 gap-4',            label: '4 cols',        description: '4-column grid with gap' },
    ],
  },

  padding: {
    id: 'padding',
    label: 'Padding',
    icon: '⬜',
    sections: [
      {
        label: 'All Sides',
        presets: ALL_SIDES_PRESETS,
      },
      {
        label: 'Horizontal (left + right)',
        presets: makePaddingSide('px'),
      },
      {
        label: 'Vertical (top + bottom)',
        presets: makePaddingSide('py'),
      },
      {
        label: 'Top',
        presets: makePaddingSide('pt'),
      },
      {
        label: 'Bottom',
        presets: makePaddingSide('pb'),
      },
      {
        label: 'Left',
        presets: makePaddingSide('pl'),
      },
      {
        label: 'Right',
        presets: makePaddingSide('pr'),
      },
    ],
  },

  margin: {
    id: 'margin',
    label: 'Margin',
    icon: '📐',
    presets: [
      { value: 'm-0',    label: 'None',   description: 'No margin' },
      { value: 'm-1',    label: 'XS',     description: 'Extra small margin — 4px' },
      { value: 'm-2',    label: 'SM',     description: 'Small margin — 8px' },
      { value: 'm-4',    label: 'MD',     description: 'Medium margin — 16px' },
      { value: 'm-6',    label: 'LG',     description: 'Large margin — 24px' },
      { value: 'm-8',    label: 'XL',     description: 'Extra large margin — 32px' },
      { value: 'm-auto', label: 'Auto',   description: 'Auto margin on all sides' },
    ],
    sections: [
      {
        label: 'Horizontal (left + right)',
        presets: makeMarginSide('mx'),
      },
      {
        label: 'Vertical (top + bottom)',
        presets: makeMarginSide('my'),
      },
      {
        label: 'Top',
        presets: makeMarginSide('mt'),
      },
      {
        label: 'Bottom',
        presets: makeMarginSide('mb'),
      },
      {
        label: 'Left',
        presets: makeMarginSide('ml'),
      },
      {
        label: 'Right',
        presets: makeMarginSide('mr'),
      },
    ],
  },

  width: {
    id: 'width',
    label: 'Width',
    icon: '↔️',
    presets: [
      { value: 'w-auto',     label: 'Auto',    description: 'Width fits content' },
      { value: 'w-full',     label: '100%',    description: 'Full width of parent' },
      { value: 'w-screen',   label: 'Screen',  description: 'Full viewport width' },
      { value: 'w-1/2',      label: '50%',     description: 'Half the parent width' },
      { value: 'w-1/3',      label: '33%',     description: 'One third the parent width' },
      { value: 'w-2/3',      label: '66%',     description: 'Two thirds the parent width' },
      { value: 'w-1/4',      label: '25%',     description: 'One quarter the parent width' },
      { value: 'w-3/4',      label: '75%',     description: 'Three quarters the parent width' },
      { value: 'max-w-sm',   label: 'Max SM',  description: 'Max width: small (384px)' },
      { value: 'max-w-md',   label: 'Max MD',  description: 'Max width: medium (448px)' },
      { value: 'max-w-lg',   label: 'Max LG',  description: 'Max width: large (512px)' },
      { value: 'max-w-xl',   label: 'Max XL',  description: 'Max width: extra large (576px)' },
      { value: 'max-w-2xl',  label: 'Max 2XL', description: 'Max width: 2× large (672px)' },
      { value: 'max-w-prose',label: 'Prose',   description: 'Max width for comfortable reading (65ch)' },
    ],
  },

  typography: {
    id: 'typography',
    label: 'Text Size',
    icon: '✏️',
    presets: [
      { value: 'text-xs',  label: 'Tiny',    description: 'Extra small text (12px)' },
      { value: 'text-sm',  label: 'Small',   description: 'Small text (14px)' },
      { value: 'text-base',label: 'Normal',  description: 'Normal / base size (16px)' },
      { value: 'text-lg',  label: 'Large',   description: 'Large text (18px)' },
      { value: 'text-xl',  label: 'XL',      description: 'Extra large text (20px)' },
      { value: 'text-2xl', label: '2XL',     description: 'Small heading (24px)' },
      { value: 'text-3xl', label: '3XL',     description: 'Medium heading (30px)' },
      { value: 'text-4xl', label: '4XL',     description: 'Large heading (36px)' },
      { value: 'text-5xl', label: '5XL',     description: 'Display heading (48px)' },
      { value: 'text-6xl', label: '6XL',     description: 'Large display (60px)' },
    ],
  },

  fontWeight: {
    id: 'fontWeight',
    label: 'Font Weight',
    icon: '🅱️',
    presets: [
      { value: 'font-thin',      label: 'Thin',     description: 'Thinnest weight (100)' },
      { value: 'font-extralight',label: 'XLight',   description: 'Extra light (200)' },
      { value: 'font-light',     label: 'Light',    description: 'Light weight (300)' },
      { value: 'font-normal',    label: 'Normal',   description: 'Normal weight (400)' },
      { value: 'font-medium',    label: 'Medium',   description: 'Medium weight (500)' },
      { value: 'font-semibold',  label: 'Semibold', description: 'Semi-bold (600)' },
      { value: 'font-bold',      label: 'Bold',     description: 'Bold (700)' },
      { value: 'font-extrabold', label: 'XBold',    description: 'Extra bold (800)' },
      { value: 'font-black',     label: 'Black',    description: 'Heaviest weight (900)' },
    ],
  },

  borderRadius: {
    id: 'borderRadius',
    label: 'Corners',
    icon: '🔲',
    presets: [
      { value: 'rounded-none', label: 'Square', description: 'No rounding — sharp corners' },
      { value: 'rounded-sm',   label: 'XS',     description: 'Very slightly rounded (2px)' },
      { value: 'rounded',      label: 'SM',     description: 'Small rounding (4px)' },
      { value: 'rounded-md',   label: 'MD',     description: 'Moderate rounding (6px)' },
      { value: 'rounded-lg',   label: 'LG',     description: 'Large rounding (8px)' },
      { value: 'rounded-xl',   label: 'XL',     description: 'Extra large rounding (12px)' },
      { value: 'rounded-2xl',  label: '2XL',    description: 'Very large rounding (16px)' },
      { value: 'rounded-3xl',  label: '3XL',    description: 'Huge rounding (24px)' },
      { value: 'rounded-full', label: 'Pill',   description: 'Pill / circle shape (9999px)' },
    ],
  },

  shadow: {
    id: 'shadow',
    label: 'Shadow',
    icon: '🌑',
    presets: [
      { value: 'shadow-none',  label: 'None',   description: 'No shadow' },
      { value: 'shadow-sm',    label: 'XS',     description: 'Very subtle shadow' },
      { value: 'shadow',       label: 'SM',     description: 'Small shadow' },
      { value: 'shadow-md',    label: 'MD',     description: 'Medium shadow' },
      { value: 'shadow-lg',    label: 'LG',     description: 'Large shadow' },
      { value: 'shadow-xl',    label: 'XL',     description: 'Extra large shadow' },
      { value: 'shadow-2xl',   label: '2XL',    description: 'Very large shadow' },
      { value: 'shadow-inner', label: 'Inner',  description: 'Shadow on the inside' },
    ],
  },

  textColor: {
    id: 'textColor',
    label: 'Text Color',
    icon: '🎨',
    presets: [
      { value: 'text-black',       label: 'Black',     description: 'Black text' },
      { value: 'text-white',       label: 'White',     description: 'White text' },
      { value: 'text-transparent', label: 'Clear',     description: 'Transparent text' },
    ],
    sections: COLORS.map(color => colorShadeSection('text', color, 'text')),
  },

  bgColor: {
    id: 'bgColor',
    label: 'Background',
    icon: '🖌️',
    presets: [
      { value: 'bg-transparent', label: 'Clear',      description: 'Transparent background' },
      { value: 'bg-white',       label: 'White',      description: 'White background' },
      { value: 'bg-black',       label: 'Black',      description: 'Black background' },
    ],
    sections: COLORS.map(color => colorShadeSection('bg', color, 'background')),
  },

  borderColor: {
    id: 'borderColor',
    label: 'Border Color',
    icon: '🟦',
    presets: [
      { value: 'border-transparent', label: 'Clear', description: 'Transparent border' },
      { value: 'border-white',       label: 'White', description: 'White border' },
      { value: 'border-black',       label: 'Black', description: 'Black border' },
    ],
    sections: COLORS.map(color => colorShadeSection('border', color, 'border')),
  },

  gap: {
    id: 'gap',
    label: 'Gap',
    icon: '↕️',
    presets: [
      { value: 'gap-0', label: 'None', description: 'No gap between children' },
      { value: 'gap-1', label: 'XS',   description: 'Tiny gap — 4px' },
      { value: 'gap-2', label: 'SM',   description: 'Small gap — 8px' },
      { value: 'gap-3', label: 'MD-',  description: 'Medium-small gap — 12px' },
      { value: 'gap-4', label: 'MD',   description: 'Medium gap — 16px' },
      { value: 'gap-6', label: 'LG',   description: 'Large gap — 24px' },
      { value: 'gap-8', label: 'XL',   description: 'Extra large gap — 32px' },
    ],
    sections: [
      {
        label: 'Horizontal gap (columns)',
        presets: [
          { value: 'gap-x-0', label: 'None', description: 'No horizontal gap' },
          { value: 'gap-x-1', label: 'XS',   description: 'Tiny horizontal gap — 4px' },
          { value: 'gap-x-2', label: 'SM',   description: 'Small horizontal gap — 8px' },
          { value: 'gap-x-4', label: 'MD',   description: 'Medium horizontal gap — 16px' },
          { value: 'gap-x-6', label: 'LG',   description: 'Large horizontal gap — 24px' },
          { value: 'gap-x-8', label: 'XL',   description: 'Extra large horizontal gap — 32px' },
        ],
      },
      {
        label: 'Vertical gap (rows)',
        presets: [
          { value: 'gap-y-0', label: 'None', description: 'No vertical gap' },
          { value: 'gap-y-1', label: 'XS',   description: 'Tiny vertical gap — 4px' },
          { value: 'gap-y-2', label: 'SM',   description: 'Small vertical gap — 8px' },
          { value: 'gap-y-4', label: 'MD',   description: 'Medium vertical gap — 16px' },
          { value: 'gap-y-6', label: 'LG',   description: 'Large vertical gap — 24px' },
          { value: 'gap-y-8', label: 'XL',   description: 'Extra large vertical gap — 32px' },
        ],
      },
    ],
  },
};

export const DEFAULT_PRESET_ORDER: Array<keyof typeof PRESET_GROUPS> = [
  'layout', 'padding', 'margin', 'gap', 'width',
  'typography', 'fontWeight',
  'textColor', 'bgColor', 'borderColor',
  'borderRadius', 'shadow',
];

export type PresetGroupKey = keyof typeof PRESET_GROUPS;
