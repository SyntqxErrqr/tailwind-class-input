import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography } from "@mui/material";
import { TailwindPreview } from "../TailwindPreview";
import { TailwindClassInput } from "../TailwindClassInput";

const meta: Meta<typeof TailwindPreview> = {
  title: "Components/TailwindPreview",
  component: TailwindPreview,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TailwindPreview>;

export const Default: Story = {
  render: (args) => (
    <TailwindPreview {...args}>
      <div>First child — gets the classes</div>
      <div>Second child — also gets the classes</div>
    </TailwindPreview>
  ),
  args: {
    classes: "bg-blue-100 text-blue-800 p-3 rounded-lg font-medium",
  },
};

export const LiveEditor: Story = {
  render: () => {
    const [classes, setClasses] = useState(
      "bg-indigo-500 text-white p-4 rounded-xl shadow-lg font-semibold text-lg",
    );
    return (
      <Box
        sx={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TailwindClassInput
          value={classes}
          onChange={setClasses}
          label="Classes to preview"
          presets={[
            "layout",
            "padding",
            "bgColor",
            "textColor",
            "borderRadius",
            "shadow",
          ]}
        />
        <Box
          sx={{
            p: 3,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            background:
              "repeating-conic-gradient(#f5f5f5 0% 25%, transparent 0% 50%) 0 0 / 16px 16px",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            display="block"
            mb={1}
          >
            Preview
          </Typography>
          <TailwindPreview classes={classes}>
            <div>Hello, world!</div>
            <div>I am the second child</div>
          </TailwindPreview>
        </Box>
      </Box>
    );
  },
};

export const MultipleChildren: Story = {
  render: () => (
    <TailwindPreview classes="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div>Card 1 content</div>
      <div>Card 2 content</div>
      <div>Card 3 content</div>
    </TailwindPreview>
  ),
};

export const WrapChildren: Story = {
  render: () => (
    <TailwindPreview
      classes="bg-green-100 text-green-800 p-2 rounded font-mono text-sm"
      wrapChildren
    >
      <span>These children</span>
      <span>are wrapped</span>
      <span>before classes applied</span>
    </TailwindPreview>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <TailwindPreview
      classes=""
      emptyState={
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            color: "text.disabled",
            fontStyle: "italic",
          }}
        >
          No classes applied yet
        </Box>
      }
    >
      <div>Child content</div>
    </TailwindPreview>
  ),
};
