import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Statosphere Guide',
  description: 'A comprehensive guide to Statosphere — the Chub.ai stage for variables, classifiers, and generators',
  base: '/statosphere-guide/',

  themeConfig: {
    nav: [
      { text: 'GitHub', link: 'https://github.com/pterror/statosphere-guide' },
      { text: 'Statosphere', link: 'https://github.com/Lord-Raven/statosphere' },
    ],

    editLink: {
      pattern: 'https://github.com/pterror/statosphere-guide/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Stage Lifecycle', link: '/lifecycle' },
          { text: 'Templating', link: '/templating' },
          { text: 'Classification Backends', link: '/classification-backends' },
          { text: 'MCP and Environment', link: '/mcp-and-environment' },
          { text: 'Gotchas', link: '/gotchas' },
        ],
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Variables', link: '/concepts/variables' },
          { text: 'Functions', link: '/concepts/functions' },
          { text: 'Classifiers', link: '/concepts/classifiers' },
          { text: 'Generators', link: '/concepts/generators' },
          { text: 'Content Rules', link: '/concepts/content-rules' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Schemas', link: '/reference/schemas' },
          { text: 'Build', link: '/reference/build' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pterror/statosphere-guide' },
    ],
  },
})
