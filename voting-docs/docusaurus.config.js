// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Votable Docs',
  tagline: 'User instruction documentation for the DreamSpace Portfolio Voting System',
  favicon: 'img/favicon.ico',

  url: 'https://voting-docs.vercel.app',
  baseUrl: '/',

  organizationName: 'DreamSpace-Academy',
  projectName: 'voting-system',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Votable Docs',
        logo: {
          alt: 'DreamSpace Academy Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'userSidebar',
            position: 'left',
            label: 'User Guide',
          },
          {
            type: 'docSidebar',
            sidebarId: 'devSidebar',
            position: 'left',
            label: 'Developer Guide',
          },
          {
            href: 'https://voting-system-ivtksriq3-paul-rajeevans-projects.vercel.app/',
            label: 'Live App',
            position: 'right',
          },
          {
            href: 'https://github.com/Paul-Rajeevan-Nimalarajah/voting-system',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'User Guide',
            items: [
              { label: 'Getting Started', to: '/user-guide/getting-started' },
              { label: 'Student Guide', to: '/user-guide/students' },
              { label: 'Staff Guide', to: '/user-guide/staff' },
              { label: 'Admin Guide', to: '/user-guide/admins' },
            ],
          },
          {
            title: 'Developer Guide',
            items: [
              { label: 'Project Setup', to: '/developer-guide/setup' },
              { label: 'Architecture', to: '/developer-guide/architecture' },
              { label: 'Database', to: '/developer-guide/database' },
              { label: 'Frontend', to: '/developer-guide/frontend' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'Live App', href: 'https://voting-system-ivtksriq3-paul-rajeevans-projects.vercel.app/' },
              { label: 'GitHub', href: 'https://github.com/Paul-Rajeevan-Nimalarajah/voting-system' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} DreamSpace Academy. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['sql', 'bash', 'json'],
      },
      announcementBar: {
        id: 'live_app',
        content:
          '🚀 The Votable app is live on Vercel! <a href="https://voting-system-ivtksriq3-paul-rajeevans-projects.vercel.app/" target="_blank">Open the App →</a>',
        backgroundColor: '#7B1FA2',
        textColor: '#ffffff',
        isCloseable: true,
      },
    }),
};

export default config;
