import prefetch from '@astrojs/prefetch';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'clone-code',
      defaultLocale: 'root', // optional
      locales: {
        root: {
          label: 'English',
          lang: 'en', // lang is required for root locales
        },
      },
      social: {
        github: 'https://github.com/Enalmada/clone-code',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            {
              label: 'Getting Started',
              link: '/guides/getting-started/',
            },
            {
              label: 'Copy File',
              link: '/guides/copy-file/',
            },
            {
              label: 'Copy Block',
              link: '/guides/copy-block/',
            },
            {
              label: 'Add Type',
              link: '/guides/add-type/',
            },
            {
              label: 'Add Todo',
              link: '/guides/add-todo/',
            },
            {
              label: 'Context Functions',
              link: '/guides/context-functions/',
            },
          ],
        },
        {
          label: 'Technologies',
          items: [
            {
              label: 'Summary',
              link: '/technologies/summary/',
            },
            {
              label: 'Build',
              link: '/technologies/build/',
            },
          ],
        },
      ],
      customCss: ['./src/assets/landing.css', './src/tailwind.css'],
    }),
    react(),
    // applyBaseStyles causes lists to not work anymore
    tailwind({
      applyBaseStyles: false,
    }),
    prefetch(),
  ],
});
