import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography, Divider } from "@mui/material";
import { TailwindClassInput } from "../TailwindClassInput";
import { TailwindPreview } from "../TailwindPreview";

const meta: Meta<typeof TailwindClassInput> = {
  title: "Components/TailwindClassInput",
  component: TailwindClassInput,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["outlined", "filled", "standard"],
    },
    size: {
      control: "select",
      options: ["small", "medium"],
    },
    matchMode: {
      control: "select",
      options: ["includes", "startsWith", "fuzzy"],
    },
    presets: {
      control: "select",
      options: [
        undefined,
        true,
        ["padding", "margin"],
        ["layout", "padding", "margin", "borderRadius", "shadow"],
      ],
      mapping: {
        undefined: undefined,
        true: true,
        "padding + margin": ["padding", "margin"],
        "layout + common": [
          "layout",
          "padding",
          "margin",
          "borderRadius",
          "shadow",
        ],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TailwindClassInput>;

// --- Basic controlled story ---
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Box sx={{ maxWidth: 600 }}>
        <TailwindClassInput
          {...args}
          value={value}
          onChange={setValue}
          label="Tailwind Classes"
        />
        <Typography
          variant="caption"
          sx={{
            mt: 1,
            display: "block",
            fontFamily: "monospace",
            color: "text.secondary",
          }}
        >
          Output: {value || "(none)"}
        </Typography>
      </Box>
    );
  },
  args: {
    variant: "outlined",
    size: "medium",
    matchMode: "includes",
    maxSuggestions: 14,
    helperText: "Start typing any Tailwind class",
  },
};

// --- With presets ---
export const WithAllPresets: Story = {
  render: (args) => {
    const [value, setValue] = useState("flex items-center gap-4");
    return (
      <Box sx={{ maxWidth: 700 }}>
        <TailwindClassInput
          {...args}
          value={value}
          onChange={setValue}
          label="Styles"
          helperText="Use the preset groups below to quickly pick common styles"
        />
      </Box>
    );
  },
  args: {
    presets: true,
    variant: "outlined",
    size: "medium",
  },
};

// --- With specific presets ---
export const PaddingAndMarginOnly: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Box sx={{ maxWidth: 600 }}>
        <TailwindClassInput
          {...args}
          value={value}
          onChange={setValue}
          label="Spacing"
          helperText='Only "Padding" and "Margin" presets enabled'
        />
      </Box>
    );
  },
  args: {
    presets: ["padding", "margin"],
    variant: "outlined",
  },
};

// --- With live preview ---
export const WithPreview: Story = {
  render: (args) => {
    const [value, setValue] = useState(
      "bg-blue-500 text-white rounded-lg p-6 font-semibold text-lg",
    );
    return (
      <Box
        sx={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TailwindClassInput
          {...args}
          value={value}
          onChange={setValue}
          label="Tailwind Classes"
          presets={true}
        />
        <Divider />
        <Typography variant="overline" color="text.secondary">
          Live Preview
        </Typography>
        <TailwindPreview
          classes={value}
          sx={{
            p: 3,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            background:
              "repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 0 0 / 16px 16px",
          }}
        >
          <div>Hello, world!</div>
          <div>Second child</div>
        </TailwindPreview>
      </Box>
    );
  },
  args: {
    variant: "outlined",
    size: "medium",
  },
};

// --- Variants ---
export const AllVariants: Story = {
  render: () => {
    const [v1, setV1] = useState("flex items-center");
    const [v2, setV2] = useState("bg-blue-500 text-white");
    const [v3, setV3] = useState("rounded-lg shadow-md");
    return (
      <Box
        sx={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 4 }}
      >
        <TailwindClassInput
          value={v1}
          onChange={setV1}
          label="Outlined (default)"
          variant="outlined"
          helperText="The default variant"
        />
        <TailwindClassInput
          value={v2}
          onChange={setV2}
          label="Filled"
          variant="filled"
          helperText="Filled variant"
        />
        <TailwindClassInput
          value={v3}
          onChange={setV3}
          label="Standard"
          variant="standard"
          helperText="Standard underline variant"
        />
      </Box>
    );
  },
};

// --- Sizes ---
export const Sizes: Story = {
  render: () => {
    const [v1, setV1] = useState("p-4 rounded-lg");
    const [v2, setV2] = useState("m-2 text-sm");
    return (
      <Box
        sx={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TailwindClassInput
          value={v1}
          onChange={setV1}
          label="Medium (default)"
          size="medium"
          variant="outlined"
        />
        <TailwindClassInput
          value={v2}
          onChange={setV2}
          label="Small"
          size="small"
          variant="outlined"
        />
      </Box>
    );
  },
};

// --- Error state ---
export const ErrorState: Story = {
  render: () => {
    const [value, setValue] = useState("bad-class");
    return (
      <Box sx={{ maxWidth: 600 }}>
        <TailwindClassInput
          value={value}
          onChange={setValue}
          label="Classes"
          error
          helperText="One or more classes are not valid Tailwind utilities"
          variant="outlined"
        />
      </Box>
    );
  },
};

// --- Disabled & ReadOnly ---
export const DisabledAndReadOnly: Story = {
  render: () => (
    <Box
      sx={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 3 }}
    >
      <TailwindClassInput
        value="flex items-center gap-4 bg-gray-100 rounded-lg p-4"
        label="Disabled"
        disabled
        variant="outlined"
      />
      <TailwindClassInput
        value="flex items-center gap-4 bg-gray-100 rounded-lg p-4"
        label="Read Only"
        readOnly
        helperText="This field is read-only"
        variant="outlined"
      />
    </Box>
  ),
};

// --- Friendly labels off ---
export const HideFriendlyLabels: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Box sx={{ maxWidth: 600 }}>
        <TailwindClassInput
          value={value}
          onChange={setValue}
          label="Classes (no friendly labels)"
          hideFriendlyLabels
          helperText="Friendly labels are hidden — technical users only"
          variant="outlined"
        />
      </Box>
    );
  },
};

// --- Custom class list ---
export const CustomClassList: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const customList = [
      "brand-primary",
      "brand-secondary",
      "brand-accent",
      "card-base",
      "card-hover",
      "btn-sm",
      "btn-md",
      "btn-lg",
      "btn-primary",
      "btn-danger",
    ];
    const extraLabels = {
      "brand-primary": "Main brand color",
      "brand-secondary": "Secondary brand color",
      "btn-primary": "Primary button style",
      "btn-danger": "Destructive action button",
    };
    return (
      <Box sx={{ maxWidth: 600 }}>
        <TailwindClassInput
          value={value}
          onChange={setValue}
          label="Design System Classes"
          classList={customList}
          extraFriendlyLabels={extraLabels}
          placeholder="Search design system classes…"
          helperText="Custom class list with design system tokens"
          variant="outlined"
        />
      </Box>
    );
  },
};

// --- Uncontrolled ---
export const Uncontrolled: Story = {
  render: () => (
    <Box sx={{ maxWidth: 600 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          alert(fd.get("tailwindClasses"));
        }}
      >
        <TailwindClassInput
          defaultValue="flex gap-4"
          name="tailwindClasses"
          label="Classes"
          helperText="Uncontrolled — value is in a hidden input named 'tailwindClasses'"
          variant="outlined"
        />
        <button type="submit" style={{ marginTop: 12 }}>
          Submit (alert value)
        </button>
      </form>
    </Box>
  ),
};

// --- Fuzzy matching ---
export const FuzzyMatching: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Box sx={{ maxWidth: 600 }}>
        <TailwindClassInput
          value={value}
          onChange={setValue}
          label="Fuzzy Match Mode"
          matchMode="fuzzy"
          helperText='Try typing "fxcl" to match "flex-col", or "bgbl" for "bg-blue-500"'
          variant="outlined"
        />
      </Box>
    );
  },
};
