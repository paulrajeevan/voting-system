// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'DreamSpace Portfolio Voting System',
  tagline: 'User Guide & Documentation',
  url: 'https://dreamspace-voting.example.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo.svg',

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
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/', // Serve the docs at the site's root
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'DreamSpace Voting Docs',
        logo: {
          alt: 'DreamSpace Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: 'https://github.com/Paul-Rajeevan-Nimalarajah/voting-system',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} DreamSpace Academy. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
      },
    }),
};

module.exports = config;
