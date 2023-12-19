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
    }),
    react(),
    // applyBaseStyles causes lists to not work anymore
    tailwind({
      applyBaseStyles: false,
    }),
    prefetch(),
  ],
});
