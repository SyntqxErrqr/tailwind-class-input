/**
 * Class conflict resolution for TailwindClassInput.
 *
 * When a new class is added, any existing class that belongs to the same
 * "property group" AND the same responsive/state prefix is removed first.
 *
 * Rules:
 *  - "md:px-4" conflicts with "md:px-2" (same prefix + group) → replace
 *  - "md:px-4" does NOT conflict with "px-2" (different prefix) → both kept
 *  - "px-4" conflicts with "px-2" (same group, no prefix) → replace
 */

// ---------------------------------------------------------------------------
// Group detection helpers
// ---------------------------------------------------------------------------

const SPACING_SCALE = /^\d+(\.\d+)?$|^(px|auto|full|screen|min|max|fit|svh|dvh|svw|dvw)$/;

/** Matches a Tailwind spacing value token like 0, 1, 2.5, px, auto, full */
function isSpacingValue(v: string): boolean {
  return SPACING_SCALE.test(v);
}

/** Tailwind color names */
const COLOR_NAMES = new Set([
  'inherit','current','transparent','black','white',
  'slate','gray','zinc','neutral','stone',
  'red','orange','amber','yellow','lime','green','emerald',
  'teal','cyan','sky','blue','indigo','violet','purple',
  'fuchsia','pink','rose',
]);

/** Color shades */
const COLOR_SHADES = new Set(['50','100','150','200','300','400','500','600','700','800','900','950']);

function isColorToken(v: string): boolean {
  // e.g. "red", "blue-500", "slate-200", "white", "transparent"
  if (COLOR_NAMES.has(v)) return true;
  const parts = v.split('-');
  if (parts.length === 2 && COLOR_NAMES.has(parts[0]) && COLOR_SHADES.has(parts[1])) return true;
  return false;
}

// ---------------------------------------------------------------------------
// The group resolver
// Returns a stable string key identifying the CSS property this class controls,
// or null if we can't determine a group (meaning: no conflict checking).
// ---------------------------------------------------------------------------

export function getPropertyGroup(className: string): string | null {
  // Strip responsive / state prefix: "md:hover:px-4" → prefix="md:hover:", base="px-4"
  const prefixMatch = className.match(/^((?:[\w-]+:)+)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const base = className.slice(prefix.length);

  const group = resolveBaseGroup(base);
  if (!group) return null;
  // Scope the group to its prefix so "md:px-4" and "px-4" don't conflict
  return prefix + group;
}

function resolveBaseGroup(cls: string): string | null {
  // Negative prefix "-" is part of the class for transforms/margins
  const isNeg = cls.startsWith('-');
  const c = isNeg ? cls.slice(1) : cls;

  // ---- Display / layout ---------------------------------------------------
  if (['block','inline-block','inline','flex','inline-flex','table','inline-table',
       'table-caption','table-cell','table-column','table-column-group',
       'table-footer-group','table-header-group','table-row-group','table-row',
       'flow-root','grid','inline-grid','contents','list-item','hidden'].includes(c)) {
    return 'display';
  }

  // ---- Position -----------------------------------------------------------
  if (['static','fixed','absolute','relative','sticky'].includes(c)) return 'position';

  // ---- Visibility ---------------------------------------------------------
  if (['visible','invisible','collapse'].includes(c)) return 'visibility';

  // ---- Overflow -----------------------------------------------------------
  if (/^overflow-x-/.test(c)) return 'overflow-x';
  if (/^overflow-y-/.test(c)) return 'overflow-y';
  if (/^overflow-/.test(c) && !c.includes('-x-') && !c.includes('-y-')) return 'overflow';

  // ---- Overscroll ---------------------------------------------------------
  if (/^overscroll-x-/.test(c)) return 'overscroll-x';
  if (/^overscroll-y-/.test(c)) return 'overscroll-y';
  if (/^overscroll-/.test(c)) return 'overscroll';

  // ---- Z-index ------------------------------------------------------------
  if (/^z-/.test(c)) return 'z-index';

  // ---- Float / clear ------------------------------------------------------
  if (/^float-/.test(c)) return 'float';
  if (/^clear-/.test(c)) return 'clear';

  // ---- Box sizing ---------------------------------------------------------
  if (/^box-/.test(c)) return 'box-sizing';

  // ---- Isolation ----------------------------------------------------------
  if (['isolate','isolation-auto'].includes(c)) return 'isolation';

  // ---- Object fit / position ----------------------------------------------
  if (/^object-/.test(c)) {
    // object-fit vs object-position: fit values are contain/cover/fill/none/scale-down
    if (['object-contain','object-cover','object-fill','object-none','object-scale-down'].includes(c)) return 'object-fit';
    return 'object-position';
  }

  // ---- Padding (per-side groups) -----------------------------------------
  // p-* (all sides), px-*, py-*, pt-*, pr-*, pb-*, pl-*
  // Each side is its own group; they can coexist
  {
    const m = c.match(/^p([xytblrs]?)-(.+)$/);
    if (m) {
      const side = m[1] || ''; // '', x, y, t, b, l, r, s, e
      if (isSpacingValue(m[2]) || m[2] === 'px') return `padding-${side || 'all'}`;
    }
  }

  // ---- Margin (per-side) -------------------------------------------------
  {
    const neg = isNeg ? '-' : '';
    const m = c.match(/^m([xytblrs]?)-(.+)$/);
    if (m) {
      const side = m[1] || '';
      return `${neg}margin-${side || 'all'}`;
    }
    // m-auto, mx-auto etc
    if (/^m[xytblrse]?-auto$/.test(c)) {
      const side = c.match(/^m([xytblrse]?)-/)?.[1] || '';
      return `margin-${side || 'all'}`;
    }
  }

  // ---- Space between ------------------------------------------------------
  if (/^-?space-x-/.test(cls)) return 'space-x';
  if (/^-?space-y-/.test(cls)) return 'space-y';

  // ---- Width --------------------------------------------------------------
  if (/^w-/.test(c)) return 'width';
  if (/^min-w-/.test(c)) return 'min-width';
  if (/^max-w-/.test(c)) return 'max-width';

  // ---- Height -------------------------------------------------------------
  if (/^h-/.test(c)) return 'height';
  if (/^min-h-/.test(c)) return 'min-height';
  if (/^max-h-/.test(c)) return 'max-height';

  // ---- Size (shorthand) ---------------------------------------------------
  if (/^size-/.test(c)) return 'size';

  // ---- Columns layout -----------------------------------------------------
  if (/^columns-/.test(c)) return 'columns';

  // ---- Aspect ratio -------------------------------------------------------
  if (/^aspect-/.test(c)) return 'aspect-ratio';

  // ---- Flex ---------------------------------------------------------------
  if (['flex-row','flex-row-reverse','flex-col','flex-col-reverse'].includes(c)) return 'flex-direction';
  if (['flex-wrap','flex-wrap-reverse','flex-nowrap'].includes(c)) return 'flex-wrap';
  if (/^flex-/.test(c) && ['flex-1','flex-auto','flex-initial','flex-none'].includes(c)) return 'flex';
  if (/^grow/.test(c)) return 'flex-grow';
  if (/^shrink/.test(c)) return 'flex-shrink';
  if (/^basis-/.test(c)) return 'flex-basis';
  if (/^order-/.test(c)) return 'order';

  // ---- Grid ---------------------------------------------------------------
  if (/^grid-cols-/.test(c)) return 'grid-template-columns';
  if (/^grid-rows-/.test(c)) return 'grid-template-rows';
  if (/^grid-flow-/.test(c)) return 'grid-auto-flow';
  if (/^auto-cols-/.test(c)) return 'grid-auto-columns';
  if (/^auto-rows-/.test(c)) return 'grid-auto-rows';
  if (/^col-span-/.test(c) || c === 'col-auto') return 'grid-column-span';
  if (/^col-start-/.test(c)) return 'grid-column-start';
  if (/^col-end-/.test(c)) return 'grid-column-end';
  if (/^row-span-/.test(c) || c === 'row-auto') return 'grid-row-span';
  if (/^row-start-/.test(c)) return 'grid-row-start';
  if (/^row-end-/.test(c)) return 'grid-row-end';

  // ---- Gap ----------------------------------------------------------------
  if (/^gap-x-/.test(c)) return 'column-gap';
  if (/^gap-y-/.test(c)) return 'row-gap';
  if (/^gap-/.test(c)) return 'gap';

  // ---- Alignment ----------------------------------------------------------
  if (/^items-/.test(c)) return 'align-items';
  if (/^justify-items-/.test(c)) return 'justify-items';
  if (/^justify-self-/.test(c)) return 'justify-self';
  if (/^justify-/.test(c)) return 'justify-content';
  if (/^self-/.test(c)) return 'align-self';
  if (/^content-/.test(c)) return 'align-content';
  if (/^place-items-/.test(c)) return 'place-items';
  if (/^place-self-/.test(c)) return 'place-self';
  if (/^place-content-/.test(c)) return 'place-content';

  // ---- Inset (top/right/bottom/left/inset) --------------------------------
  if (/^inset-x-/.test(c)) return 'inset-x';
  if (/^inset-y-/.test(c)) return 'inset-y';
  if (/^inset-/.test(c) && !c.includes('-x-') && !c.includes('-y-')) return 'inset';
  if (/^top-/.test(c) || (isNeg && /^top-/.test(c))) return 'top';
  if (/^right-/.test(c) || (isNeg && /^right-/.test(c))) return 'right';
  if (/^bottom-/.test(c) || (isNeg && /^bottom-/.test(c))) return 'bottom';
  if (/^left-/.test(c) || (isNeg && /^left-/.test(c))) return 'left';

  // ---- Typography — font family -------------------------------------------
  if (['font-sans','font-serif','font-mono'].includes(c)) return 'font-family';

  // ---- Typography — font size ---------------------------------------------
  if (/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(c)) return 'font-size';

  // ---- Typography — font weight -------------------------------------------
  if (/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(c)) return 'font-weight';

  // ---- Typography — font style --------------------------------------------
  if (['italic','not-italic'].includes(c)) return 'font-style';

  // ---- Text color (separate from font-size which also uses "text-") -------
  {
    const m = c.match(/^text-(.+)$/);
    if (m && isColorToken(m[1])) return 'text-color';
    // text-color with opacity: text-blue-500/50
    if (m && /^.+-\d+\/\d+$/.test(m[1])) return 'text-color';
  }

  // ---- Text align ---------------------------------------------------------
  if (/^text-(left|center|right|justify|start|end)$/.test(c)) return 'text-align';

  // ---- Text decoration ----------------------------------------------------
  if (['underline','overline','line-through','no-underline'].includes(c)) return 'text-decoration-line';
  if (/^decoration-/.test(c)) {
    if (/^decoration-(solid|double|dotted|dashed|wavy)$/.test(c)) return 'text-decoration-style';
    if (/^decoration-(auto|from-font|\d+)$/.test(c)) return 'text-decoration-thickness';
    if (isColorToken(c.replace(/^decoration-/, ''))) return 'text-decoration-color';
    return 'text-decoration-color'; // fallback for color tokens
  }

  // ---- Text transform -----------------------------------------------------
  if (['uppercase','lowercase','capitalize','normal-case'].includes(c)) return 'text-transform';

  // ---- Text overflow / wrap -----------------------------------------------
  if (['truncate','text-ellipsis','text-clip'].includes(c)) return 'text-overflow';
  if (/^whitespace-/.test(c)) return 'white-space';
  if (/^break-/.test(c)) return 'word-break';
  if (/^hyphens-/.test(c)) return 'hyphens';
  if (/^line-clamp-/.test(c)) return 'line-clamp';
  if (/^indent-/.test(c)) return 'text-indent';

  // ---- Line height --------------------------------------------------------
  if (/^leading-/.test(c)) return 'line-height';

  // ---- Letter spacing -----------------------------------------------------
  if (/^tracking-/.test(c)) return 'letter-spacing';

  // ---- Vertical align -----------------------------------------------------
  if (/^align-/.test(c)) return 'vertical-align';

  // ---- List ---------------------------------------------------------------
  if (['list-none','list-disc','list-decimal'].includes(c)) return 'list-style-type';
  if (['list-inside','list-outside'].includes(c)) return 'list-style-position';

  // ---- Background color ---------------------------------------------------
  {
    const m = c.match(/^bg-(.+)$/);
    if (m) {
      const val = m[1].split('/')[0]; // strip opacity modifier
      if (isColorToken(val)) return 'background-color';
      if (['inherit','current','transparent','black','white'].includes(val)) return 'background-color';
    }
  }

  // ---- Background image (gradient) ----------------------------------------
  if (/^bg-gradient-/.test(c)) return 'background-image';
  if (/^from-/.test(c)) return 'gradient-from';
  if (/^via-/.test(c)) return 'gradient-via';
  if (/^to-/.test(c)) return 'gradient-to';

  // ---- Background other properties ----------------------------------------
  if (/^bg-(fixed|local|scroll)$/.test(c)) return 'background-attachment';
  if (/^bg-clip-/.test(c)) return 'background-clip';
  if (/^bg-(repeat|no-repeat|repeat-x|repeat-y|repeat-round|repeat-space)$/.test(c)) return 'background-repeat';
  if (/^bg-(auto|cover|contain)$/.test(c)) return 'background-size';
  if (/^bg-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/.test(c)) return 'background-position';
  if (/^bg-origin-/.test(c)) return 'background-origin';

  // ---- Border width (per-side) -------------------------------------------
  if (/^border-t(-\d+)?$/.test(c)) return 'border-top-width';
  if (/^border-r(-\d+)?$/.test(c)) return 'border-right-width';
  if (/^border-b(-\d+)?$/.test(c)) return 'border-bottom-width';
  if (/^border-l(-\d+)?$/.test(c)) return 'border-left-width';
  if (/^border-x(-\d+)?$/.test(c)) return 'border-x-width';
  if (/^border-y(-\d+)?$/.test(c)) return 'border-y-width';
  if (/^border(-\d+)?$/.test(c)) return 'border-width';

  // ---- Border style -------------------------------------------------------
  if (/^border-(solid|dashed|dotted|double|hidden|none)$/.test(c)) return 'border-style';

  // ---- Border color (per-side) -------------------------------------------
  {
    const m = c.match(/^border-([trbl])-(.+)$/) ?? c.match(/^border-([xy])-(.+)$/);
    if (m && isColorToken(m[2].split('/')[0])) return `border-${m[1]}-color`;
  }
  {
    const m = c.match(/^border-(.+)$/);
    if (m && isColorToken(m[1].split('/')[0])) return 'border-color';
  }

  // ---- Border radius (per-corner) ----------------------------------------
  if (/^rounded-tl/.test(c)) return 'border-radius-tl';
  if (/^rounded-tr/.test(c)) return 'border-radius-tr';
  if (/^rounded-bl/.test(c)) return 'border-radius-bl';
  if (/^rounded-br/.test(c)) return 'border-radius-br';
  if (/^rounded-t/.test(c)) return 'border-radius-t';
  if (/^rounded-r/.test(c)) return 'border-radius-r';
  if (/^rounded-b/.test(c)) return 'border-radius-b';
  if (/^rounded-l/.test(c)) return 'border-radius-l';
  if (/^rounded/.test(c)) return 'border-radius';

  // ---- Outline ------------------------------------------------------------
  if (/^outline(-\d+|-(none|dashed|dotted|double))?$/.test(c)) return 'outline-style';
  if (/^outline-\d+$/.test(c)) return 'outline-width';
  if (/^outline-offset-/.test(c)) return 'outline-offset';
  if (/^outline-/.test(c)) {
    const val = c.replace(/^outline-/, '');
    if (isColorToken(val.split('/')[0])) return 'outline-color';
  }

  // ---- Ring ---------------------------------------------------------------
  if (/^ring-(inset|\d+)$/.test(c) || c === 'ring') return 'ring-width';
  if (/^ring-offset-\d+$/.test(c)) return 'ring-offset-width';
  if (/^ring-offset-/.test(c)) return 'ring-offset-color';
  if (/^ring-/.test(c)) {
    const val = c.replace(/^ring-/, '');
    if (isColorToken(val.split('/')[0])) return 'ring-color';
  }

  // ---- Shadow -------------------------------------------------------------
  if (/^shadow(-sm|-md|-lg|-xl|-2xl|-inner|-none)?$/.test(c)) return 'box-shadow-size';
  if (/^shadow-/.test(c)) {
    const val = c.replace(/^shadow-/, '');
    if (isColorToken(val.split('/')[0])) return 'box-shadow-color';
  }

  // ---- Drop shadow filter -------------------------------------------------
  if (/^drop-shadow/.test(c)) return 'filter-drop-shadow';

  // ---- Opacity ------------------------------------------------------------
  if (/^opacity-/.test(c)) return 'opacity';

  // ---- Mix blend ----------------------------------------------------------
  if (/^mix-blend-/.test(c)) return 'mix-blend-mode';
  if (/^bg-blend-/.test(c)) return 'background-blend-mode';

  // ---- Filters ------------------------------------------------------------
  if (/^blur-/.test(c) || c === 'blur') return 'filter-blur';
  if (/^brightness-/.test(c)) return 'filter-brightness';
  if (/^contrast-/.test(c)) return 'filter-contrast';
  if (/^grayscale/.test(c)) return 'filter-grayscale';
  if (/^hue-rotate-/.test(c)) return 'filter-hue-rotate';
  if (/^invert/.test(c)) return 'filter-invert';
  if (/^saturate-/.test(c)) return 'filter-saturate';
  if (/^sepia/.test(c)) return 'filter-sepia';

  // ---- Backdrop filters ---------------------------------------------------
  if (/^backdrop-blur/.test(c)) return 'backdrop-blur';
  if (/^backdrop-brightness/.test(c)) return 'backdrop-brightness';
  if (/^backdrop-contrast/.test(c)) return 'backdrop-contrast';
  if (/^backdrop-grayscale/.test(c)) return 'backdrop-grayscale';
  if (/^backdrop-hue-rotate/.test(c)) return 'backdrop-hue-rotate';
  if (/^backdrop-invert/.test(c)) return 'backdrop-invert';
  if (/^backdrop-opacity/.test(c)) return 'backdrop-opacity';
  if (/^backdrop-saturate/.test(c)) return 'backdrop-saturate';
  if (/^backdrop-sepia/.test(c)) return 'backdrop-sepia';

  // ---- Transitions --------------------------------------------------------
  if (/^transition/.test(c)) return 'transition-property';
  if (/^duration-/.test(c)) return 'transition-duration';
  if (/^ease-/.test(c)) return 'transition-timing';
  if (/^delay-/.test(c)) return 'transition-delay';

  // ---- Animation ----------------------------------------------------------
  if (/^animate-/.test(c)) return 'animation';

  // ---- Transform ----------------------------------------------------------
  if (/^scale-x-/.test(c)) return 'transform-scale-x';
  if (/^scale-y-/.test(c)) return 'transform-scale-y';
  if (/^scale-/.test(c)) return 'transform-scale';
  if (/^rotate-/.test(c)) return 'transform-rotate';
  if (/^translate-x-/.test(c)) return 'transform-translate-x';
  if (/^translate-y-/.test(c)) return 'transform-translate-y';
  if (/^skew-x-/.test(c)) return 'transform-skew-x';
  if (/^skew-y-/.test(c)) return 'transform-skew-y';
  if (/^transform/.test(c)) return 'transform-mode';
  if (/^origin-/.test(c)) return 'transform-origin';
  if (/^perspective-/.test(c)) return 'perspective';

  // ---- Cursor -------------------------------------------------------------
  if (/^cursor-/.test(c)) return 'cursor';

  // ---- Pointer events -----------------------------------------------------
  if (/^pointer-events-/.test(c)) return 'pointer-events';

  // ---- Resize -------------------------------------------------------------
  if (/^resize/.test(c)) return 'resize';

  // ---- Scroll behavior ----------------------------------------------------
  if (/^scroll-(auto|smooth)$/.test(c)) return 'scroll-behavior';
  if (/^scroll-m[xytblrse]?-/.test(c)) return `scroll-margin-${c.match(/^scroll-m([xytblrse]?)/)?.[1] || 'all'}`;
  if (/^scroll-p[xytblrse]?-/.test(c)) return `scroll-padding-${c.match(/^scroll-p([xytblrse]?)/)?.[1] || 'all'}`;
  if (/^snap-/.test(c)) return 'scroll-snap';
  if (/^overscroll/.test(c)) return 'overscroll';
  if (/^touch-/.test(c)) return 'touch-action';

  // ---- User select --------------------------------------------------------
  if (/^select-/.test(c)) return 'user-select';

  // ---- Will change --------------------------------------------------------
  if (/^will-change-/.test(c)) return 'will-change';

  // ---- Appearance ---------------------------------------------------------
  if (/^appearance-/.test(c)) return 'appearance';

  // ---- Caret color --------------------------------------------------------
  if (/^caret-/.test(c)) return 'caret-color';

  // ---- Accent color -------------------------------------------------------
  if (/^accent-/.test(c)) return 'accent-color';

  // ---- Fill / stroke ------------------------------------------------------
  if (/^fill-/.test(c)) return 'fill';
  if (/^stroke-\d+$/.test(c)) return 'stroke-width';
  if (/^stroke-/.test(c)) return 'stroke-color';

  // ---- Table --------------------------------------------------------------
  if (/^table-/.test(c)) return 'table-layout';
  if (/^border-(collapse|separate)$/.test(c)) return 'border-collapse';
  if (/^border-spacing/.test(c)) return 'border-spacing';
  if (/^caption-/.test(c)) return 'caption-side';

  // ---- Accessibility ------------------------------------------------------
  if (['sr-only','not-sr-only'].includes(c)) return 'screen-reader';

  // ---- Font variant / numeric ---------------------------------------------
  if (/^(tabular|oldstyle|lining|proportional|diagonal|stacked)-nums$/.test(c) ||
      /^(ordinal|slashed-zero|normal-nums)$/.test(c)) return 'font-variant-numeric';

  // ---- Antialiasing -------------------------------------------------------
  if (['antialiased','subpixel-antialiased'].includes(c)) return 'font-smoothing';

  // ---- Print --------------------------------------------------------------
  if (/^(break-before|break-after|break-inside)-/.test(c)) return `page-${c.split('-').slice(0,2).join('-')}`;

  // ---- Divide (special case of border) ------------------------------------
  if (/^divide-x/.test(c)) return 'divide-x';
  if (/^divide-y/.test(c)) return 'divide-y';
  if (/^divide-(solid|dashed|dotted|double|none)$/.test(c)) return 'divide-style';
  if (/^divide-/.test(c)) return 'divide-color';

  // ---- Placeholder --------------------------------------------------------
  if (/^placeholder-/.test(c)) {
    const val = c.replace(/^placeholder-/, '');
    if (isColorToken(val.split('/')[0])) return 'placeholder-color';
    return 'placeholder-opacity';
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Given an existing class list and a set of new classes to add,
 * returns the updated list with conflicting classes replaced.
 *
 * @param existing   Current class array
 * @param incoming   New class(es) to add (space-separated string)
 */
export function mergeClasses(existing: string[], incoming: string[]): string[] {
  // Build group map for existing classes
  const existingGroups = new Map<string, string>(); // group → className
  for (const cls of existing) {
    const group = getPropertyGroup(cls);
    if (group) existingGroups.set(group, cls);
  }

  // For each incoming class, determine which existing to evict
  const toRemove = new Set<string>();
  for (const cls of incoming) {
    const group = getPropertyGroup(cls);
    if (group && existingGroups.has(group)) {
      const conflict = existingGroups.get(group)!;
      if (conflict !== cls) toRemove.add(conflict);
    }
  }

  const filtered = existing.filter(cls => !toRemove.has(cls));
  const toAdd = incoming.filter(cls => !filtered.includes(cls));
  return [...filtered, ...toAdd];
}
