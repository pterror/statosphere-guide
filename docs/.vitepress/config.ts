import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Statosphere Guide',
  description: 'Variables, classifiers, and generators for your Chub.ai bots — no code required.',
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
        text: 'Start',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Getting Started', link: '/getting-started' },
        ],
      },
      {
        text: 'Syntax',
        items: [
          { text: 'Overview', link: '/syntax/overview' },
          { text: 'Variables', link: '/syntax/variables' },
          { text: 'Expressions', link: '/syntax/expressions' },
          { text: 'Functions', link: '/syntax/functions' },
          { text: 'Classifiers', link: '/syntax/classifiers' },
          { text: 'Generators', link: '/syntax/generators' },
          { text: 'Content Rules', link: '/syntax/content-rules' },
        ],
      },
      {
        text: 'Recipes',
        items: [
          { text: 'Stat Tracking', link: '/recipes/stat-tracking' },
          { text: 'Scene Direction', link: '/recipes/scene-direction' },
          { text: 'Response Guidance', link: '/recipes/response-guidance' },
          { text: 'Input Cleanup', link: '/recipes/input-cleanup' },
        ],
      },
      {
        text: 'Feasibility',
        items: [
          { text: 'Can I build this?', link: '/feasibility/' },
          { text: 'Worked Sketches', link: '/feasibility/worked-sketches' },
          { text: 'Patterns', link: '/feasibility/patterns' },
        ],
      },
      {
        text: 'Special',
        items: [
          { text: '/setVar Command', link: '/special/setvar' },
          { text: 'Debug Mode', link: '/special/debug-mode' },
          { text: 'Debugging Guide', link: '/special/debugging' },
          { text: 'Background Variable', link: '/special/background' },
          { text: 'Turn Order', link: '/special/turn-order' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Quick Reference', link: '/reference/quick-reference' },
          { text: 'Gotchas', link: '/reference/gotchas' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pterror/statosphere-guide' },
    ],
  },
})
