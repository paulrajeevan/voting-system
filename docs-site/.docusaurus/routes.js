import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', 'ae0'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'c40'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '0b2'),
            routes: [
              {
                path: '/admins',
                component: ComponentCreator('/admins', 'b16'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/developers',
                component: ComponentCreator('/developers', '736'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/staff',
                component: ComponentCreator('/staff', '7fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/students',
                component: ComponentCreator('/students', 'e82'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', 'fc9'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
