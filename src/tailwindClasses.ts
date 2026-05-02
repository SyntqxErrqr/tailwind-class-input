/**
 * Comprehensive Tailwind CSS class list for autocomplete.
 * Covers Tailwind v3 core utilities + all color variants + responsive/state prefixes.
 */

const spacing = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];
const colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const colorShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const screens = ['sm', 'md', 'lg', 'xl', '2xl'];
const stateVariants = ['hover', 'focus', 'focus-within', 'focus-visible', 'active', 'visited', 'target', 'first', 'last', 'only', 'odd', 'even', 'first-of-type', 'last-of-type', 'empty', 'disabled', 'enabled', 'checked', 'indeterminate', 'default', 'required', 'valid', 'invalid', 'placeholder', 'placeholder-shown', 'autofill', 'read-only', 'open', 'before', 'after', 'selection', 'marker', 'file', 'backdrop', 'print', 'dark', 'rtl', 'ltr', 'motion-safe', 'motion-reduce', 'peer', 'group', 'peer-hover', 'peer-focus', 'peer-checked', 'peer-disabled', 'group-hover', 'group-focus', 'group-active', 'group-disabled'];

function sp(prefix: string) {
  return spacing.map(s => `${prefix}-${s}`);
}
function spSides(prefix: string) {
  return [
    ...sp(prefix),
    ...spacing.map(s => `${prefix}x-${s}`),
    ...spacing.map(s => `${prefix}y-${s}`),
    ...spacing.map(s => `${prefix}t-${s}`),
    ...spacing.map(s => `${prefix}r-${s}`),
    ...spacing.map(s => `${prefix}b-${s}`),
    ...spacing.map(s => `${prefix}l-${s}`),
    `${prefix}-auto`, `${prefix}x-auto`, `${prefix}y-auto`, `${prefix}t-auto`, `${prefix}r-auto`, `${prefix}b-auto`, `${prefix}l-auto`,
    ...spacing.map(s => `-${prefix}-${s}`),
    ...spacing.map(s => `-${prefix}x-${s}`),
    ...spacing.map(s => `-${prefix}t-${s}`),
    ...spacing.map(s => `-${prefix}b-${s}`),
  ];
}
function colorClasses(prefix: string, extras: string[] = []) {
  const result: string[] = [...extras];
  for (const c of colors) {
    for (const s of colorShades) {
      result.push(`${prefix}-${c}-${s}`);
    }
  }
  result.push(`${prefix}-white`, `${prefix}-black`, `${prefix}-transparent`, `${prefix}-current`, `${prefix}-inherit`);
  return result;
}

const baseClasses: string[] = [
  // Layout
  'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden',
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'inset-auto', 'inset-0', 'inset-x-0', 'inset-y-0', '-inset-full',
  ...spacing.map(s => `inset-${s}`),
  ...spacing.map(s => `inset-x-${s}`),
  ...spacing.map(s => `inset-y-${s}`),
  ...spacing.map(s => `top-${s}`),
  ...spacing.map(s => `right-${s}`),
  ...spacing.map(s => `bottom-${s}`),
  ...spacing.map(s => `left-${s}`),
  'top-auto', 'right-auto', 'bottom-auto', 'left-auto', 'top-full', 'right-full', 'bottom-full', 'left-full',
  'top-1/2', 'left-1/2', 'top-1/3', 'top-2/3', 'left-1/3', 'left-2/3',
  '-top-1', '-top-2', '-top-4', '-right-1', '-right-2', '-bottom-1', '-left-1',
  'visible', 'invisible', 'collapse',
  'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-auto', '-z-10', '-z-50',
  'float-right', 'float-left', 'float-none',
  'clear-left', 'clear-right', 'clear-both', 'clear-none',
  'isolate', 'isolation-auto',
  'box-border', 'box-content',
  'object-contain', 'object-cover', 'object-fill', 'object-none', 'object-scale-down',
  'object-bottom', 'object-center', 'object-left', 'object-left-bottom', 'object-left-top', 'object-right', 'object-right-bottom', 'object-right-top', 'object-top',
  'overflow-auto', 'overflow-hidden', 'overflow-clip', 'overflow-visible', 'overflow-scroll',
  'overflow-x-auto', 'overflow-x-hidden', 'overflow-x-clip', 'overflow-x-visible', 'overflow-x-scroll',
  'overflow-y-auto', 'overflow-y-hidden', 'overflow-y-clip', 'overflow-y-visible', 'overflow-y-scroll',
  'overscroll-auto', 'overscroll-contain', 'overscroll-none',
  'overscroll-x-auto', 'overscroll-x-contain', 'overscroll-x-none',
  'overscroll-y-auto', 'overscroll-y-contain', 'overscroll-y-none',

  // Flexbox
  'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
  'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
  'flex-1', 'flex-auto', 'flex-initial', 'flex-none',
  'grow', 'grow-0', 'shrink', 'shrink-0',
  'basis-auto', 'basis-full', 'basis-1/2', 'basis-1/3', 'basis-2/3', 'basis-1/4', 'basis-3/4', 'basis-1/5', 'basis-2/5', 'basis-3/5', 'basis-4/5',
  ...spacing.map(s => `basis-${s}`),
  'flex-grow', 'flex-grow-0', 'flex-shrink', 'flex-shrink-0',
  'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
  'justify-normal', 'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly', 'justify-stretch',
  'justify-items-start', 'justify-items-end', 'justify-items-center', 'justify-items-stretch',
  'justify-self-auto', 'justify-self-start', 'justify-self-end', 'justify-self-center', 'justify-self-stretch',
  'content-normal', 'content-center', 'content-start', 'content-end', 'content-between', 'content-around', 'content-evenly', 'content-stretch',
  'self-auto', 'self-start', 'self-end', 'self-center', 'self-stretch', 'self-baseline',
  'place-content-center', 'place-content-start', 'place-content-end', 'place-content-between', 'place-content-around', 'place-content-evenly', 'place-content-baseline', 'place-content-stretch',
  'place-items-start', 'place-items-end', 'place-items-center', 'place-items-baseline', 'place-items-stretch',
  'place-self-auto', 'place-self-start', 'place-self-end', 'place-self-center', 'place-self-stretch',
  'order-1', 'order-2', 'order-3', 'order-4', 'order-5', 'order-6', 'order-7', 'order-8', 'order-9', 'order-10', 'order-11', 'order-12', 'order-first', 'order-last', 'order-none',

  // Grid
  'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11', 'grid-cols-12', 'grid-cols-none', 'grid-cols-subgrid',
  'col-auto', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8', 'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12', 'col-span-full',
  'col-start-1', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7', 'col-start-auto',
  'col-end-1', 'col-end-2', 'col-end-3', 'col-end-4', 'col-end-5', 'col-end-6', 'col-end-7', 'col-end-auto',
  'grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5', 'grid-rows-6', 'grid-rows-none', 'grid-rows-subgrid',
  'row-auto', 'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4', 'row-span-5', 'row-span-6', 'row-span-full',
  'row-start-1', 'row-start-2', 'row-start-3', 'row-start-4', 'row-start-5', 'row-start-auto',
  'row-end-1', 'row-end-2', 'row-end-3', 'row-end-4', 'row-end-5', 'row-end-auto',
  'grid-flow-row', 'grid-flow-col', 'grid-flow-dense', 'grid-flow-row-dense', 'grid-flow-col-dense',
  'auto-cols-auto', 'auto-cols-min', 'auto-cols-max', 'auto-cols-fr',
  'auto-rows-auto', 'auto-rows-min', 'auto-rows-max', 'auto-rows-fr',
  ...spacing.map(s => `gap-${s}`),
  ...spacing.map(s => `gap-x-${s}`),
  ...spacing.map(s => `gap-y-${s}`),

  // Spacing
  ...spSides('p'),
  ...spSides('m'),
  ...spacing.map(s => `space-x-${s}`),
  ...spacing.map(s => `space-y-${s}`),
  ...spacing.map(s => `-space-x-${s}`),
  ...spacing.map(s => `-space-y-${s}`),
  'space-x-reverse', 'space-y-reverse',

  // Sizing
  'w-auto', 'w-full', 'w-screen', 'w-svw', 'w-lvw', 'w-dvw', 'w-min', 'w-max', 'w-fit',
  'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-2/4', 'w-3/4', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-1/6', 'w-5/6',
  ...spacing.map(s => `w-${s}`),
  'h-auto', 'h-full', 'h-screen', 'h-svh', 'h-lvh', 'h-dvh', 'h-min', 'h-max', 'h-fit',
  'h-1/2', 'h-1/3', 'h-2/3', 'h-1/4', 'h-3/4', 'h-1/5', 'h-2/5', 'h-3/5', 'h-4/5',
  ...spacing.map(s => `h-${s}`),
  'size-auto', 'size-full', 'size-min', 'size-max', 'size-fit',
  ...spacing.map(s => `size-${s}`),
  'min-w-0', 'min-w-full', 'min-w-min', 'min-w-max', 'min-w-fit',
  'max-w-none', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full', 'max-w-min', 'max-w-max', 'max-w-fit', 'max-w-prose', 'max-w-screen-sm', 'max-w-screen-md', 'max-w-screen-lg', 'max-w-screen-xl', 'max-w-screen-2xl',
  'min-h-0', 'min-h-full', 'min-h-screen', 'min-h-svh', 'min-h-dvh', 'min-h-min', 'min-h-max', 'min-h-fit',
  'max-h-full', 'max-h-screen', 'max-h-svh', 'max-h-dvh', 'max-h-min', 'max-h-max', 'max-h-fit', 'max-h-none',
  ...spacing.map(s => `max-h-${s}`),

  // Typography
  'font-sans', 'font-serif', 'font-mono',
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
  'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
  'italic', 'not-italic',
  'tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',
  'leading-3', 'leading-4', 'leading-5', 'leading-6', 'leading-7', 'leading-8', 'leading-9', 'leading-10', 'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed', 'leading-loose',
  'text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end',
  'uppercase', 'lowercase', 'capitalize', 'normal-case',
  'underline', 'overline', 'line-through', 'no-underline',
  'decoration-solid', 'decoration-double', 'decoration-dotted', 'decoration-dashed', 'decoration-wavy',
  'decoration-auto', 'decoration-from-font', 'decoration-0', 'decoration-1', 'decoration-2', 'decoration-4', 'decoration-8',
  'underline-offset-auto', 'underline-offset-0', 'underline-offset-1', 'underline-offset-2', 'underline-offset-4', 'underline-offset-8',
  'truncate', 'text-ellipsis', 'text-clip',
  'break-normal', 'break-words', 'break-all', 'break-keep',
  'whitespace-normal', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-pre-line', 'whitespace-pre-wrap', 'whitespace-break-spaces',
  'hyphens-none', 'hyphens-manual', 'hyphens-auto',
  'indent-0', 'indent-1', 'indent-2', 'indent-4', 'indent-8', 'indent-16',
  'align-baseline', 'align-top', 'align-middle', 'align-bottom', 'align-text-top', 'align-text-bottom', 'align-sub', 'align-super',
  'list-none', 'list-disc', 'list-decimal',
  'list-inside', 'list-outside',
  'antialiased', 'subpixel-antialiased',
  'tabular-nums', 'oldstyle-nums', 'lining-nums', 'proportional-nums', 'diagonal-fractions', 'stacked-fractions', 'ordinal', 'slashed-zero',
  'normal-nums',
  'line-clamp-1', 'line-clamp-2', 'line-clamp-3', 'line-clamp-4', 'line-clamp-5', 'line-clamp-6', 'line-clamp-none',

  // Colors — text
  ...colorClasses('text', ['text-inherit', 'text-current']),
  ...colorClasses('text').map(c => `${c}/10`),
  ...colorClasses('text').map(c => `${c}/20`),
  ...colorClasses('text').map(c => `${c}/25`),
  ...colorClasses('text').map(c => `${c}/50`),
  ...colorClasses('text').map(c => `${c}/75`),

  // Colors — background
  ...colorClasses('bg', ['bg-inherit', 'bg-current']),
  'bg-none',
  ...colorClasses('bg').map(c => `${c}/10`),
  ...colorClasses('bg').map(c => `${c}/20`),
  ...colorClasses('bg').map(c => `${c}/25`),
  ...colorClasses('bg').map(c => `${c}/50`),
  ...colorClasses('bg').map(c => `${c}/75`),

  // Gradients
  'bg-gradient-to-t', 'bg-gradient-to-tr', 'bg-gradient-to-r', 'bg-gradient-to-br', 'bg-gradient-to-b', 'bg-gradient-to-bl', 'bg-gradient-to-l', 'bg-gradient-to-tl',
  ...colorClasses('from'),
  ...colorClasses('via'),
  ...colorClasses('to'),
  'from-transparent', 'via-transparent', 'to-transparent',
  'from-0%', 'from-5%', 'from-10%', 'from-25%', 'from-50%', 'from-75%', 'from-100%',
  'via-0%', 'via-5%', 'via-10%', 'via-25%', 'via-50%', 'via-75%', 'via-100%',
  'to-0%', 'to-5%', 'to-10%', 'to-25%', 'to-50%', 'to-75%', 'to-100%',

  // Background utilities
  'bg-fixed', 'bg-local', 'bg-scroll',
  'bg-clip-border', 'bg-clip-padding', 'bg-clip-content', 'bg-clip-text',
  'bg-repeat', 'bg-no-repeat', 'bg-repeat-x', 'bg-repeat-y', 'bg-repeat-round', 'bg-repeat-space',
  'bg-auto', 'bg-cover', 'bg-contain',
  'bg-bottom', 'bg-center', 'bg-left', 'bg-left-bottom', 'bg-left-top', 'bg-right', 'bg-right-bottom', 'bg-right-top', 'bg-top',
  'bg-origin-border', 'bg-origin-padding', 'bg-origin-content',

  // Border
  'border', 'border-0', 'border-2', 'border-4', 'border-8',
  'border-t', 'border-r', 'border-b', 'border-l', 'border-x', 'border-y',
  'border-t-0', 'border-r-0', 'border-b-0', 'border-l-0',
  'border-t-2', 'border-r-2', 'border-b-2', 'border-l-2',
  'border-t-4', 'border-r-4', 'border-b-4', 'border-l-4',
  'border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-hidden', 'border-none',
  ...colorClasses('border', ['border-inherit', 'border-current']),
  'border-opacity-0', 'border-opacity-5', 'border-opacity-10', 'border-opacity-20', 'border-opacity-25', 'border-opacity-50', 'border-opacity-75', 'border-opacity-100',
  'divide-x', 'divide-y', 'divide-x-0', 'divide-y-0', 'divide-x-2', 'divide-y-2', 'divide-x-4', 'divide-y-4', 'divide-x-8', 'divide-y-8', 'divide-x-reverse', 'divide-y-reverse',
  'divide-solid', 'divide-dashed', 'divide-dotted', 'divide-double', 'divide-none',
  ...colorClasses('divide'),

  // Border radius
  'rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
  'rounded-t-none', 'rounded-t-sm', 'rounded-t', 'rounded-t-md', 'rounded-t-lg', 'rounded-t-xl', 'rounded-t-2xl', 'rounded-t-3xl', 'rounded-t-full',
  'rounded-r-none', 'rounded-r-sm', 'rounded-r', 'rounded-r-md', 'rounded-r-lg', 'rounded-r-xl', 'rounded-r-full',
  'rounded-b-none', 'rounded-b-sm', 'rounded-b', 'rounded-b-md', 'rounded-b-lg', 'rounded-b-xl', 'rounded-b-2xl', 'rounded-b-3xl', 'rounded-b-full',
  'rounded-l-none', 'rounded-l-sm', 'rounded-l', 'rounded-l-md', 'rounded-l-lg', 'rounded-l-xl', 'rounded-l-full',
  'rounded-tl-none', 'rounded-tl-sm', 'rounded-tl', 'rounded-tl-md', 'rounded-tl-lg', 'rounded-tl-xl', 'rounded-tl-2xl', 'rounded-tl-3xl', 'rounded-tl-full',
  'rounded-tr-none', 'rounded-tr-sm', 'rounded-tr', 'rounded-tr-md', 'rounded-tr-lg', 'rounded-tr-xl', 'rounded-tr-2xl', 'rounded-tr-3xl', 'rounded-tr-full',
  'rounded-bl-none', 'rounded-bl-sm', 'rounded-bl', 'rounded-bl-md', 'rounded-bl-lg', 'rounded-bl-xl', 'rounded-bl-2xl', 'rounded-bl-3xl', 'rounded-bl-full',
  'rounded-br-none', 'rounded-br-sm', 'rounded-br', 'rounded-br-md', 'rounded-br-lg', 'rounded-br-xl', 'rounded-br-2xl', 'rounded-br-3xl', 'rounded-br-full',

  // Outline
  'outline-none', 'outline', 'outline-dashed', 'outline-dotted', 'outline-double',
  'outline-0', 'outline-1', 'outline-2', 'outline-4', 'outline-8',
  ...colorClasses('outline'),
  'outline-offset-0', 'outline-offset-1', 'outline-offset-2', 'outline-offset-4', 'outline-offset-8',

  // Ring
  'ring-0', 'ring-1', 'ring-2', 'ring', 'ring-4', 'ring-8', 'ring-inset',
  ...colorClasses('ring'),
  'ring-opacity-0', 'ring-opacity-10', 'ring-opacity-20', 'ring-opacity-25', 'ring-opacity-50', 'ring-opacity-75', 'ring-opacity-100',
  'ring-offset-0', 'ring-offset-1', 'ring-offset-2', 'ring-offset-4', 'ring-offset-8',
  ...colorClasses('ring-offset'),

  // Shadow
  'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner', 'shadow-none',
  ...colorClasses('shadow'),

  // Opacity
  'opacity-0', 'opacity-5', 'opacity-10', 'opacity-15', 'opacity-20', 'opacity-25', 'opacity-30', 'opacity-35', 'opacity-40', 'opacity-45', 'opacity-50', 'opacity-55', 'opacity-60', 'opacity-65', 'opacity-70', 'opacity-75', 'opacity-80', 'opacity-85', 'opacity-90', 'opacity-95', 'opacity-100',

  // Mix blend
  'mix-blend-normal', 'mix-blend-multiply', 'mix-blend-screen', 'mix-blend-overlay', 'mix-blend-darken', 'mix-blend-lighten', 'mix-blend-color-dodge', 'mix-blend-color-burn', 'mix-blend-hard-light', 'mix-blend-soft-light', 'mix-blend-difference', 'mix-blend-exclusion', 'mix-blend-hue', 'mix-blend-saturation', 'mix-blend-color', 'mix-blend-luminosity', 'mix-blend-plus-lighter',
  'bg-blend-normal', 'bg-blend-multiply', 'bg-blend-screen', 'bg-blend-overlay', 'bg-blend-darken', 'bg-blend-lighten', 'bg-blend-color-dodge', 'bg-blend-color-burn', 'bg-blend-hard-light', 'bg-blend-soft-light', 'bg-blend-difference', 'bg-blend-exclusion', 'bg-blend-hue', 'bg-blend-saturation', 'bg-blend-color', 'bg-blend-luminosity',

  // Filters
  'blur-none', 'blur-sm', 'blur', 'blur-md', 'blur-lg', 'blur-xl', 'blur-2xl', 'blur-3xl',
  'brightness-0', 'brightness-50', 'brightness-75', 'brightness-90', 'brightness-95', 'brightness-100', 'brightness-105', 'brightness-110', 'brightness-125', 'brightness-150', 'brightness-200',
  'contrast-0', 'contrast-50', 'contrast-75', 'contrast-100', 'contrast-125', 'contrast-150', 'contrast-200',
  'drop-shadow-sm', 'drop-shadow', 'drop-shadow-md', 'drop-shadow-lg', 'drop-shadow-xl', 'drop-shadow-2xl', 'drop-shadow-none',
  'grayscale-0', 'grayscale',
  'hue-rotate-0', 'hue-rotate-15', 'hue-rotate-30', 'hue-rotate-60', 'hue-rotate-90', 'hue-rotate-180',
  '-hue-rotate-15', '-hue-rotate-30', '-hue-rotate-60', '-hue-rotate-90', '-hue-rotate-180',
  'invert-0', 'invert',
  'saturate-0', 'saturate-50', 'saturate-100', 'saturate-150', 'saturate-200',
  'sepia-0', 'sepia',
  'filter', 'filter-none',
  'backdrop-blur-none', 'backdrop-blur-sm', 'backdrop-blur', 'backdrop-blur-md', 'backdrop-blur-lg', 'backdrop-blur-xl', 'backdrop-blur-2xl', 'backdrop-blur-3xl',
  'backdrop-brightness-0', 'backdrop-brightness-50', 'backdrop-brightness-75', 'backdrop-brightness-90', 'backdrop-brightness-95', 'backdrop-brightness-100', 'backdrop-brightness-105', 'backdrop-brightness-110', 'backdrop-brightness-125', 'backdrop-brightness-150', 'backdrop-brightness-200',
  'backdrop-contrast-0', 'backdrop-contrast-50', 'backdrop-contrast-75', 'backdrop-contrast-100', 'backdrop-contrast-125', 'backdrop-contrast-150', 'backdrop-contrast-200',
  'backdrop-grayscale-0', 'backdrop-grayscale',
  'backdrop-invert-0', 'backdrop-invert',
  'backdrop-opacity-0', 'backdrop-opacity-5', 'backdrop-opacity-10', 'backdrop-opacity-25', 'backdrop-opacity-50', 'backdrop-opacity-75', 'backdrop-opacity-100',
  'backdrop-saturate-0', 'backdrop-saturate-50', 'backdrop-saturate-100', 'backdrop-saturate-150', 'backdrop-saturate-200',
  'backdrop-sepia-0', 'backdrop-sepia',
  'backdrop-hue-rotate-0', 'backdrop-hue-rotate-15', 'backdrop-hue-rotate-30', 'backdrop-hue-rotate-60', 'backdrop-hue-rotate-90', 'backdrop-hue-rotate-180',
  'backdrop-filter', 'backdrop-filter-none',

  // Transitions & Animation
  'transition-none', 'transition-all', 'transition', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform',
  'duration-0', 'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
  'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
  'delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-500', 'delay-700', 'delay-1000',
  'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',

  // Transforms
  'scale-0', 'scale-x-0', 'scale-y-0', 'scale-50', 'scale-x-50', 'scale-y-50', 'scale-75', 'scale-x-75', 'scale-y-75', 'scale-90', 'scale-x-90', 'scale-y-90', 'scale-95', 'scale-x-95', 'scale-y-95', 'scale-100', 'scale-x-100', 'scale-y-100', 'scale-105', 'scale-x-105', 'scale-y-105', 'scale-110', 'scale-x-110', 'scale-y-110', 'scale-125', 'scale-x-125', 'scale-y-125', 'scale-150', 'scale-x-150', 'scale-y-150',
  '-scale-x-100', '-scale-y-100', '-scale-100',
  'rotate-0', 'rotate-1', 'rotate-2', 'rotate-3', 'rotate-6', 'rotate-12', 'rotate-45', 'rotate-90', 'rotate-180',
  '-rotate-1', '-rotate-2', '-rotate-3', '-rotate-6', '-rotate-12', '-rotate-45', '-rotate-90', '-rotate-180',
  'translate-x-0', 'translate-x-px', 'translate-x-full', 'translate-x-1/2',
  'translate-y-0', 'translate-y-px', 'translate-y-full', 'translate-y-1/2',
  '-translate-x-full', '-translate-x-1/2', '-translate-x-px',
  '-translate-y-full', '-translate-y-1/2', '-translate-y-px',
  ...spacing.map(s => `translate-x-${s}`),
  ...spacing.map(s => `translate-y-${s}`),
  ...spacing.map(s => `-translate-x-${s}`),
  ...spacing.map(s => `-translate-y-${s}`),
  'skew-x-0', 'skew-x-1', 'skew-x-2', 'skew-x-3', 'skew-x-6', 'skew-x-12', '-skew-x-1', '-skew-x-2', '-skew-x-3', '-skew-x-6', '-skew-x-12',
  'skew-y-0', 'skew-y-1', 'skew-y-2', 'skew-y-3', 'skew-y-6', 'skew-y-12', '-skew-y-1', '-skew-y-2', '-skew-y-3', '-skew-y-6', '-skew-y-12',
  'transform', 'transform-cpu', 'transform-gpu', 'transform-none',
  'origin-center', 'origin-top', 'origin-top-right', 'origin-right', 'origin-bottom-right', 'origin-bottom', 'origin-bottom-left', 'origin-left', 'origin-top-left',

  // Interactivity
  'appearance-none', 'appearance-auto',
  'cursor-auto', 'cursor-default', 'cursor-pointer', 'cursor-wait', 'cursor-text', 'cursor-move', 'cursor-help', 'cursor-not-allowed', 'cursor-none', 'cursor-context-menu', 'cursor-progress', 'cursor-cell', 'cursor-crosshair', 'cursor-vertical-text', 'cursor-alias', 'cursor-copy', 'cursor-no-drop', 'cursor-grab', 'cursor-grabbing', 'cursor-all-scroll', 'cursor-col-resize', 'cursor-row-resize', 'cursor-n-resize', 'cursor-e-resize', 'cursor-s-resize', 'cursor-w-resize', 'cursor-ne-resize', 'cursor-nw-resize', 'cursor-se-resize', 'cursor-sw-resize', 'cursor-ew-resize', 'cursor-ns-resize', 'cursor-nesw-resize', 'cursor-nwse-resize', 'cursor-zoom-in', 'cursor-zoom-out',
  'pointer-events-none', 'pointer-events-auto',
  'resize-none', 'resize', 'resize-x', 'resize-y',
  'scroll-auto', 'scroll-smooth',
  'scroll-m-0', 'scroll-m-1', 'scroll-m-2', 'scroll-m-4', 'scroll-m-8', 'scroll-m-16', 'scroll-mx-0', 'scroll-mx-4', 'scroll-my-0', 'scroll-my-4', 'scroll-mt-0', 'scroll-mt-4', 'scroll-mt-8', 'scroll-mr-0', 'scroll-mb-0', 'scroll-ml-0',
  'scroll-p-0', 'scroll-p-1', 'scroll-p-2', 'scroll-p-4', 'scroll-p-8', 'scroll-p-16', 'scroll-px-0', 'scroll-px-4', 'scroll-py-0', 'scroll-py-4', 'scroll-pt-0', 'scroll-pt-4', 'scroll-pt-8', 'scroll-pr-0', 'scroll-pb-0', 'scroll-pl-0',
  'snap-none', 'snap-x', 'snap-y', 'snap-both', 'snap-mandatory', 'snap-proximity',
  'snap-start', 'snap-end', 'snap-center', 'snap-align-none',
  'snap-normal', 'snap-always',
  'touch-auto', 'touch-none', 'touch-pan-x', 'touch-pan-left', 'touch-pan-right', 'touch-pan-y', 'touch-pan-up', 'touch-pan-down', 'touch-pinch-zoom', 'touch-manipulation',
  'select-none', 'select-text', 'select-all', 'select-auto',
  'will-change-auto', 'will-change-scroll', 'will-change-contents', 'will-change-transform',

  // SVG
  'fill-none', 'fill-inherit', 'fill-current', 'fill-transparent',
  ...colorClasses('fill'),
  'stroke-none', 'stroke-inherit', 'stroke-current', 'stroke-transparent',
  ...colorClasses('stroke'),
  'stroke-0', 'stroke-1', 'stroke-2',

  // Accessibility
  'sr-only', 'not-sr-only',

  // Tables
  'table-auto', 'table-fixed',
  'border-collapse', 'border-separate',
  'border-spacing-0', 'border-spacing-1', 'border-spacing-2', 'border-spacing-4', 'border-spacing-x-0', 'border-spacing-y-0',
  'caption-top', 'caption-bottom',

  // Columns
  'columns-auto', 'columns-1', 'columns-2', 'columns-3', 'columns-4', 'columns-5', 'columns-6', 'columns-7', 'columns-8', 'columns-9', 'columns-10', 'columns-11', 'columns-12', 'columns-3xs', 'columns-2xs', 'columns-xs', 'columns-sm', 'columns-md', 'columns-lg', 'columns-xl', 'columns-2xl', 'columns-3xl', 'columns-4xl', 'columns-5xl', 'columns-6xl', 'columns-7xl',
  'break-before-auto', 'break-before-avoid', 'break-before-all', 'break-before-avoid-page', 'break-before-page', 'break-before-left', 'break-before-right', 'break-before-column',
  'break-after-auto', 'break-after-avoid', 'break-after-all', 'break-after-avoid-page', 'break-after-page', 'break-after-left', 'break-after-right', 'break-after-column',
  'break-inside-auto', 'break-inside-avoid', 'break-inside-avoid-page', 'break-inside-avoid-column',

  // Aspect ratio
  'aspect-auto', 'aspect-square', 'aspect-video',

  // Placeholder
  ...colorClasses('placeholder'),
  'placeholder-opacity-0', 'placeholder-opacity-25', 'placeholder-opacity-50', 'placeholder-opacity-75', 'placeholder-opacity-100',

  // Caret
  ...colorClasses('caret'),
  'caret-auto',

  // Accent
  ...colorClasses('accent'),
  'accent-auto',

  // Decoration color
  ...colorClasses('decoration'),

  // Container
  'container',

  // Print
  'print:hidden', 'print:block', 'print:flex',
];

// Generate all responsive + state prefixed variants
const prefixes = [
  ...screens.map(s => `${s}:`),
  ...stateVariants.map(v => `${v}:`),
];

// Build combined flat list (base + prefixed)
const allPrefixedClasses: string[] = [];
for (const prefix of prefixes) {
  for (const cls of baseClasses.slice(0, 500)) { // Prefix only common classes to keep list manageable
    allPrefixedClasses.push(`${prefix}${cls}`);
  }
}

export const TAILWIND_CLASSES: string[] = Array.from(new Set([...baseClasses, ...allPrefixedClasses]));

export default TAILWIND_CLASSES;
