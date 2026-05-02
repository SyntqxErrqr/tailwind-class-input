import React, { memo, useCallback, useMemo } from 'react';
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  SxProps,
  Theme,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';
import { PRESET_GROUPS, DEFAULT_PRESET_ORDER, PresetGroupKey, PresetClass } from './presets';

// ---------------------------------------------------------------------------
// Static sx objects — defined once at module level so emotion never
// recalculates them on re-renders.
// ---------------------------------------------------------------------------
const sxChipLabel = { px: 0.75 } as const;
const sxSubLabel: SxProps<Theme> = {
  color: 'text.disabled',
  fontSize: '0.64rem',
  fontWeight: 500,
  display: 'block',
  pt: 0.5,
  pb: 0.25,
  pl: 0.25,
  userSelect: 'none',
};
const sxChipRow: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.5,
  pb: 0.5,
  pl: 0.25,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresetsPanelProps {
  presets: true | PresetGroupKey[];
  /** Stable callback — wrap in useCallback in parent */
  onPresetClick: (classes: string) => void;
  /**
   * Pass a Set<string> instead of an array so isActive checks are O(1).
   * PresetsPanel accepts either; internally it always uses a Set.
   */
  activeSet: ReadonlySet<string>;
  sx?: SxProps<Theme>;
}

// ---------------------------------------------------------------------------
// PresetChip — memoized so it only re-renders when its own props change.
// The key insight: isActive is derived from a Set lookup, so the parent can
// pass a stable Set reference and each chip won't re-render unless its own
// class moves in or out of the active set.
// ---------------------------------------------------------------------------
const PresetChip = memo(function PresetChip({
  preset,
  isActive,
  isSmall,
  onPresetClick,
}: {
  preset: PresetClass;
  isActive: boolean;
  isSmall?: boolean;
  onPresetClick: (v: string) => void;
}) {
  const handleClick = useCallback(() => onPresetClick(preset.value), [onPresetClick, preset.value]);

  return (
    <Tooltip title={preset.description ?? preset.label} placement="top" arrow>
      <Chip
        label={preset.label}
        size="small"
        variant={isActive ? 'filled' : 'outlined'}
        color={isActive ? 'primary' : 'default'}
        onClick={handleClick}
        sx={{
          height: isSmall ? 22 : 24,
          fontSize: isSmall ? '0.65rem' : '0.7rem',
          fontFamily: 'inherit',
          cursor: 'pointer',
          '& .MuiChip-label': sxChipLabel,
        }}
      />
    </Tooltip>
  );
});

// ---------------------------------------------------------------------------
// PresetChipRow — renders a flat list of chips for one group/section.
// Memoized so it only re-renders when activeSet or presets array changes.
// ---------------------------------------------------------------------------
const PresetChipRow = memo(function PresetChipRow({
  presets,
  activeSet,
  isSmall,
  onPresetClick,
}: {
  presets: PresetClass[];
  activeSet: ReadonlySet<string>;
  isSmall?: boolean;
  onPresetClick: (v: string) => void;
}) {
  return (
    <Box sx={sxChipRow}>
      {presets.map(preset => {
        // O(1) per-chip active check — split multi-class presets
        const classes = preset.value.split(' ');
        const isActive = classes.every(c => activeSet.has(c));
        return (
          <PresetChip
            key={preset.value}
            preset={preset}
            isActive={isActive}
            isSmall={isSmall}
            onPresetClick={onPresetClick}
          />
        );
      })}
    </Box>
  );
});

// ---------------------------------------------------------------------------
// PresetGroup — one collapsible group. Memoized.
// Subsections are always-expanded (non-collapsible) — just a static label.
// ---------------------------------------------------------------------------
const PresetGroupPanel = memo(function PresetGroupPanel({
  id,
  activeSet,
  onPresetClick,
}: {
  id: PresetGroupKey;
  activeSet: ReadonlySet<string>;
  onPresetClick: (v: string) => void;
}) {
  const theme = useTheme();
  const group = PRESET_GROUPS[id];
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(v => !v), []);

  const sxGroupHeader: SxProps<Theme> = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    cursor: 'pointer',
    userSelect: 'none',
    py: 0.5,
    px: 0.5,
    borderRadius: 1,
    '&:hover': { backgroundColor: theme.palette.action.hover },
  }), [theme.palette.action.hover]);

  return (
    <Box sx={{ mb: 0.25 }}>
      {/* Group header — toggles the group open/closed */}
      <Box onClick={toggle} sx={sxGroupHeader}>
        {group.icon && (
          <Typography component="span" sx={{ fontSize: '0.85rem', lineHeight: 1 }}>
            {group.icon}
          </Typography>
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.68rem',
            flexGrow: 1,
          }}
        >
          {group.label}
        </Typography>
        <IconButton size="small" disableRipple sx={{ p: 0, color: 'text.disabled' }}>
          {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Group body */}
      <Collapse in={isOpen}>
        <Box sx={{ pl: 0.5, pb: 0.75 }}>

          {/* Top-level flat presets (always shown when group is open) */}
          {group.presets && group.presets.length > 0 && (
            <PresetChipRow
              presets={group.presets}
              activeSet={activeSet}
              onPresetClick={onPresetClick}
              isSmall={false}
            />
          )}

          {/* Sub-sections — always expanded, just a static label */}
          {group.sections?.map((section, si) => (
            <Box key={si}>
              <Typography variant="caption" sx={sxSubLabel}>
                {section.label}
              </Typography>
              <PresetChipRow
                presets={section.presets}
                activeSet={activeSet}
                isSmall
                onPresetClick={onPresetClick}
              />
            </Box>
          ))}
        </Box>
      </Collapse>

      <Divider sx={{ opacity: 0.4 }} />
    </Box>
  );
});

// ---------------------------------------------------------------------------
// PresetsPanel — top-level. Memoized. Derives groupIds once from props.
// ---------------------------------------------------------------------------
export const PresetsPanel = memo(function PresetsPanel({
  presets,
  onPresetClick,
  activeSet,
  sx,
}: PresetsPanelProps) {
  const groupIds: PresetGroupKey[] = useMemo(
    () =>
      presets === true
        ? DEFAULT_PRESET_ORDER
        : presets.filter((id): id is PresetGroupKey => id in PRESET_GROUPS),
    [presets]
  );

  if (groupIds.length === 0) return null;

  return (
    <Box sx={{ mt: 1, ...sx }}>
      {groupIds.map(id => (
        <PresetGroupPanel
          key={id}
          id={id}
          activeSet={activeSet}
          onPresetClick={onPresetClick}
        />
      ))}
    </Box>
  );
});

export default PresetsPanel;
