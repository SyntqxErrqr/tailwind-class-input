# tailwind-class-input

An autocomplete input for Tailwind CSS class names built for **MUI v5** and **React Admin**. Designed for users who may not know CSS — includes human-friendly labels, one-click presets, and a live preview companion component.

# Note from the developer

I started this project because I wanted an input to autocomplete tailwind classes and couldn't find anything that existed for it. This is written entirely by Claude Sonnet 4.6, and if the result didn't turn out well, I would have scrapped it. I don't intend on maintaining it beyond my own personal/business use.

If this project doesn't satisfy your use-case, you're welcome to fork the project and adjust it to your liking.

This was built to be opinionated towards React Admin to be used for the [SpringMicroHost](https://springmicrohost.com) Website Editor. If you happen to be looking for hosting, or business tools (CRM, eCommerce, Forms, & more), don't hesitate to reach out!

---

## Features

- **Full Tailwind v3 class list** — 10,000+ classes including all color variants, responsive prefixes, and state variants
- **Friendly labels** — 300+ classes have plain-English descriptions shown in the autocomplete dropdown and as chip tooltips (e.g. `flex` → "Side by side", `rounded-full` → "Pill / circle shape")
- **One-click presets** — opt-in collapsible groups for padding, margin, typography, font weight, text color, background color, border radius, shadow, layout, and width
- **Chips below the input** — applied classes appear below as removable chips with a tooltip showing the friendly label on hover
- **MUI-native** — respects `variant`, `size`, `error`, `label`, `helperText`, `sx`, and all standard MUI field props
- **React Admin ready** — participates in RHF form context via `useInput`; registers value in a hidden native input
- **Standard form integration** — hidden `<input name={name}>` works with plain HTML forms too
- **Keyboard-first** — arrows, Tab, Enter, Backspace, Escape all work as expected
- **Flexible matching** — `includes` (default), `startsWith`, or `fuzzy`
- **Separate `TailwindPreview`** — applies classes to 1st-layer children only

---

## Installation

```bash
npm install tailwind-class-input
```

**Peer dependencies:**

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled react react-dom
```

---

## Quick Start

```tsx
import { TailwindClassInput } from "tailwind-class-input";

function MyForm() {
  const [classes, setClasses] = React.useState("");

  return (
    <TailwindClassInput
      label="Tailwind Classes"
      name="classes"
      value={classes}
      onChange={setClasses}
    />
  );
}
```

---

## Friendly Labels

Classes with known friendly labels show them in the autocomplete dropdown:

```
flex          Side by side
rounded-full  Pill / circle shape
shadow-lg     Large shadow
text-center   Centered text
```

On chips, the label appears as a tooltip when you hover.

Disable labels entirely:

```tsx
<TailwindClassInput hideFriendlyLabels ... />
```

Add your own labels on top of (or overriding) the built-in ones:

```tsx
<TailwindClassInput
  extraFriendlyLabels={{
    'my-custom-class': 'My custom component style',
    'p-4': 'Comfortable padding', // overrides built-in
  }}
  ...
/>
```

---

## Presets

Presets are opt-in groups of commonly needed classes, shown as collapsible panels below the input. Great for users who don't know what to search for.

```tsx
// Show all preset groups
<TailwindClassInput presets={true} ... />

// Show only specific groups
<TailwindClassInput presets={['padding', 'margin']} ... />

// Common combo for a style editor
<TailwindClassInput
  presets={['layout', 'padding', 'margin', 'borderRadius', 'shadow', 'bgColor', 'textColor']}
  ...
/>
```

**Available preset group IDs:**

| ID             | Label       | Contents                                 |
| -------------- | ----------- | ---------------------------------------- |
| `layout`       | Layout      | flex, grid, hidden, centering combos     |
| `padding`      | Padding     | p-0 through p-16, px/py variants         |
| `margin`       | Margin      | m-0 through m-8, mx-auto, mt/mb variants |
| `width`        | Width       | w-full, w-1/2, max-w-\*                  |
| `typography`   | Text Size   | text-xs through text-5xl                 |
| `fontWeight`   | Font Weight | thin through black                       |
| `textColor`    | Text Color  | white, black, all brand colors           |
| `bgColor`      | Background  | transparent, white, black, all colors    |
| `borderRadius` | Corners     | none through full/pill                   |
| `shadow`       | Shadow      | none through 2xl + inner                 |

Active presets are highlighted so users can see what's already applied.

---

## With TailwindPreview

```tsx
import { TailwindClassInput, TailwindPreview } from "tailwind-class-input";

function StyleEditor() {
  const [classes, setClasses] = React.useState(
    "bg-blue-500 text-white rounded-lg p-4",
  );

  return (
    <>
      <TailwindClassInput
        label="Classes"
        value={classes}
        onChange={setClasses}
        presets={true}
      />

      <TailwindPreview classes={classes}>
        {/* Each direct child gets the classes applied */}
        <div>Card one</div>
        <div>Card two</div>
      </TailwindPreview>
    </>
  );
}
```

`TailwindPreview` applies the class string to **every direct child** via `cloneElement`. Grandchildren are never touched. Pass `wrapChildren` to force wrapping with a `<div>` instead.

---

## React Admin

```tsx
import { useInput } from "react-admin";
import { createTailwindClassField } from "tailwind-class-input";

// Create once at module level
const TailwindClassField = createTailwindClassField(useInput);

function MyEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="name" />
        <TailwindClassField
          source="className"
          label="Tailwind Classes"
          presets={["padding", "margin", "borderRadius"]}
          fullWidth
        />
      </SimpleForm>
    </Edit>
  );
}
```

---

## Props — TailwindClassInput

| Prop                  | Type                                    | Default                     | Description                         |
| --------------------- | --------------------------------------- | --------------------------- | ----------------------------------- |
| `value`               | `string`                                | —                           | Controlled class string             |
| `defaultValue`        | `string`                                | `''`                        | Uncontrolled initial value          |
| `onChange`            | `(v: string) => void`                   | —                           | Called on every change              |
| `name`                | `string`                                | —                           | Hidden input name for form binding  |
| `label`               | `ReactNode`                             | —                           | Floating label                      |
| `helperText`          | `ReactNode`                             | —                           | Text below input                    |
| `error`               | `boolean`                               | `false`                     | Error state                         |
| `required`            | `boolean`                               | `false`                     | Required marker                     |
| `disabled`            | `boolean`                               | `false`                     | Disabled                            |
| `readOnly`            | `boolean`                               | `false`                     | Read-only                           |
| `placeholder`         | `string`                                | `'Search or type a class…'` | Input placeholder                   |
| `classList`           | `string[]`                              | Full TW list                | Custom class list                   |
| `extraFriendlyLabels` | `Record<string, string>`                | —                           | Additional/override friendly labels |
| `hideFriendlyLabels`  | `boolean`                               | `false`                     | Hide all friendly labels            |
| `maxSuggestions`      | `number`                                | `14`                        | Max dropdown items                  |
| `matchMode`           | `'includes' \| 'startsWith' \| 'fuzzy'` | `'includes'`                | Filtering mode                      |
| `presets`             | `true \| PresetGroupKey[]`              | —                           | Enable preset groups                |
| `sx`                  | `SxProps<Theme>`                        | —                           | MUI sx on root `FormControl`        |
| `variant`             | `'outlined' \| 'filled' \| 'standard'`  | `'outlined'`                | MUI variant                         |
| `size`                | `'small' \| 'medium'`                   | `'medium'`                  | MUI size                            |
| `fullWidth`           | `boolean`                               | `true`                      | Full-width layout                   |

---

## Props — TailwindPreview

| Prop           | Type             | Default         | Description                                  |
| -------------- | ---------------- | --------------- | -------------------------------------------- |
| `classes`      | `string`         | `''`            | Classes applied to each direct child         |
| `children`     | `ReactNode`      | Placeholder div | Content                                      |
| `sx`           | `SxProps<Theme>` | —               | MUI sx on wrapper `Box`                      |
| `wrapChildren` | `boolean`        | `false`         | Wrap each child in a `<div>` before applying |
| `emptyState`   | `ReactNode`      | —               | Shown when `classes` is empty                |

---

## Dev / Storybook

```bash
npm install
npm run dev       # starts Storybook on :6006
```

## Build

```bash
npm run build     # rm -rf dist && vite build
```

---

## Keyboard Shortcuts

| Key                 | Action                                      |
| ------------------- | ------------------------------------------- |
| `Space` / `Enter`   | Add current token or highlighted suggestion |
| `Tab`               | Accept first (or highlighted) suggestion    |
| `↑` / `↓`           | Navigate dropdown                           |
| `Escape`            | Close dropdown                              |
| `Backspace` (empty) | Remove last chip                            |

---

## License

MIT
