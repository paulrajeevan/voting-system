/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'User Guides',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'students',
          label: 'Student Guide',
        },
        {
          type: 'doc',
          id: 'staff',
          label: 'Staff Guide',
        },
        {
          type: 'doc',
          id: 'admins',
          label: 'Administrator Guide',
        },
      ],
    },
    {
      type: 'doc',
      id: 'developers',
      label: 'Developer Reference',
    },
  ],
};

module.exports = sidebars;
