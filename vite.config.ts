import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/**/*.stories.tsx', '**/*.test.tsx'],
    }),
  ],

  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'react-admin': resolve(__dirname, 'src/reactAdmin.tsx'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'es' ? `${entryName}.esm.js` : `${entryName}.js`,
    },
    rollupOptions: {
      // Never bundle peer dependencies
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@mui/material',
        '@mui/material/styles',
        '@mui/icons-material',
        '@mui/icons-material/ExpandMore',
        '@mui/icons-material/ExpandLess',
        '@emotion/react',
        '@emotion/styled',
        'react-admin',
      ],
      output: {
        // Preserve directory structure in output
        preserveModules: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MuiMaterial',
          '@emotion/react': 'emotionReact',
          '@emotion/styled': 'emotionStyled',
        },
      },
    },
    sourcemap: true,
    // Reduce noise in output
    minify: false,
  },
});
