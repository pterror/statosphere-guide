---
layout: home

hero:
  name: Statosphere Guide
  text: Variables, classifiers, and generators for your Chub.ai bots — no code required.
  tagline: An unofficial guide to Lord-Raven's Statosphere stage. Add stat tracking, behavior rules, image generation, and more to any Chub.ai bot through simple JSON config.
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: Statosphere on GitHub
      link: https://github.com/Lord-Raven/statosphere

features:
  - title: Variables
    details: Track numbers, strings, and flags that persist across the conversation — health points, relationship scores, current mood, scene name, and anything else you want to remember.
    link: /syntax/variables
  - title: Classifiers
    details: Automatically read the mood, topic, or meaning of what the user or bot says, and update your variables accordingly — no manual triggers needed.
    link: /syntax/classifiers
  - title: Generators
    details: Fire extra LLM or image-generation calls to produce scene art, recap summaries, or any creative content, gated on conditions you define.
    link: /syntax/generators
  - title: Content Rules
    details: Rewrite the user's message before the bot sees it, inject hidden instructions, or filter the bot's reply before it appears in chat — all driven by your variables.
    link: /syntax/content-rules
  - title: Expressions
    details: Every formula field accepts a small expression language (mathjs) with arithmetic, comparisons, string operations, and Statosphere's own helpers like contains() and capture().
    link: /syntax/expressions
---

## About This Guide

This is an unofficial third-party guide to [Statosphere](https://github.com/Lord-Raven/statosphere), a Chub.ai stage extension by Lord-Raven. It is not produced or endorsed by the Statosphere maintainers.

The guide is pinned to commit [`e67cd9f`](https://github.com/Lord-Raven/statosphere/tree/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7). Where a default value or specific behavior is non-obvious, claims link to the source at that commit.
