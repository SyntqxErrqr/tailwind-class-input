import React from 'react';
import type { Preview } from '@storybook/react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const lightTheme = createTheme({ palette: { mode: 'light' } });
const darkTheme = createTheme({ palette: { mode: 'dark' } });

const preview: Preview = {
  globalTypes: {
    muiTheme: {
      name: 'MUI Theme',
      description: 'MUI color mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.muiTheme === 'dark';
      return (
        <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
          <CssBaseline />
          <div style={{ padding: '2rem', background: isDark ? '#121212' : '#ffffff', minHeight: '100vh' }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    controls: { expanded: true },
    layout: 'fullscreen',
  },
};

export default preview;
