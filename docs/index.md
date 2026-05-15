---
layout: home

hero:
  name: Statosphere Guide
  text: Variables, Classifiers, Generators, and Content Rules for Chub.ai
  tagline: An unofficial third-party guide to Lord-Raven/statosphere — making the codebase legible to botmakers and developers.
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/Lord-Raven/statosphere

features:
  - title: Variables
    details: Persistent state across turns — per-turn, per-input, pre/post-response update phases, with automatic non-constant promotion when referenced by generators or classifiers.
    link: /concepts/variables
  - title: Classifiers
    details: Zero-shot NLI classification via remote Gradio, in-browser Xenova, or LLM-driven entailment scoring. Candidate labels, category grouping, and dynamic label expressions.
    link: /concepts/classifiers
  - title: Generators
    details: Text, image, and image-to-image generation gated by conditions and phases. Results update variables. Retry logic via configurable condition expressions.
    link: /concepts/generators
  - title: Content Rules
    details: Five categories (Input, Post Input, Stage Direction, Response, Post Response) with condition + modification expressions to rewrite messages and inject system prompts.
    link: /concepts/content-rules
  - title: Templating
    details: "Template tags: user, char, personality, scenario, plus all variable names (case-insensitive). Known quirks: the regex [A-z] includes punctuation."
    link: /templating
  - title: Stage Lifecycle
    details: End-to-end walkthrough of beforePrompt and afterResponse — what runs when, the busy-wait loop, and how LoadResponse.error is repurposed.
    link: /lifecycle
---

## About This Guide

This is an unofficial third-party guide to [Statosphere](https://github.com/Lord-Raven/statosphere), a Chub.ai stage extension by Lord-Raven. It is not produced or endorsed by the Statosphere maintainers.

The guide is pinned to commit [`e67cd9f`](https://github.com/Lord-Raven/statosphere/tree/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7). Every nontrivial claim cites a source permalink at that commit. The upstream README is two lines; substantive documentation lives inside `creator_notes` in `chub_meta.yaml`. This guide makes the full codebase legible.
