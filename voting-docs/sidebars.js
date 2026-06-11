/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  userSidebar: [
    {
      type: 'category',
      label: 'User Guide',
      collapsed: false,
      items: [
        'user-guide/getting-started',
        'user-guide/students',
        'user-guide/staff',
        'user-guide/admins',
      ],
    },
  ],
  devSidebar: [
    {
      type: 'category',
      label: 'Developer Guide',
      collapsed: false,
      items: [
        'developer-guide/setup',
        'developer-guide/architecture',
        'developer-guide/database',
        'developer-guide/frontend',
        'developer-guide/design-system',
        'developer-guide/git-workflow',
        'developer-guide/testing',
      ],
    },
  ],
};

export default sidebars;
