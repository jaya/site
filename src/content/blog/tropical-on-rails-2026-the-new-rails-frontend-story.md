---
title: 'Tropical on Rails 2026: The New Rails Frontend Story'
description: 'Two talks from Tropical on Rails 2026 show how Rails is investing in the frontend — Herb as a unified parser unlocking real tooling, and a real-world migration from React back to Hotwire.'
pubDate: '2026-04-20'
author: 'Elias Sousa'
image: '/blog/tropical-on-rails-2026-the-new-rails-frontend-story/cover.jpg'
tags: ['tech', 'rails', 'frontend', 'hotwire', 'conferences', 'tropical_on_rails']
draft: false
---

Rails has long been criticized for its frontend story: "great for the backend, but the moment you need real frontend work, you're on your own." ERB templates had no proper tooling, Hotwire was young, and the ecosystem felt thin.

Tropical on Rails 2026 showed that narrative is changing fast. Two talks in particular, taken together, paint a coherent picture of where Rails is headed on the frontend.

> This post is part of a short series from Tropical on Rails 2026. The first entry covered [three talks on sustainable Rails engineering](/blog/tropical-on-rails-2026-3-talks-on-sustainable-rails).

---

## 1. Herb: A Unified Grammar for the View Layer

**Marco Roth @ Full Stack Developer & Open Source Contributor**

Marco opened the conference with a keynote that, in my view, addresses the deepest root cause behind Rails' frontend tooling gap: ERB never had a formal grammar.

### The problem no one had solved

Five years ago, Marco started building Stimulus LSP -- a language server to provide autocomplete and diagnostics for Stimulus controllers. It worked for plain HTML but completely broke down on ERB templates, because no tool understood both HTML and ERB at the same time. This wasn't just a Stimulus problem. It explained why the Rails ecosystem never had a truly good ERB linter, formatter, or language server. Developers coming from TypeScript felt this acutely -- there was no real-time feedback loop in the view layer, and you had to actually run the app to discover errors.

The root cause: ERB is a general-purpose templating system. It can produce emails, plain text, anything. The ERB engine (Erubi, in Rails' case) treats Ruby code blocks as opaque black boxes, concatenating output without understanding the HTML structure around them. Existing parsers like Nokogiri and Prism each understand their own domain (HTML and Ruby, respectively), but they lose positional context when used on ERB templates. You can't tell whether an interpolation is inside an attribute, an element, or at the top level.

Marco drew a sharp parallel to Elixir: Elixir has EEx (Embedded Elixir) plus HEEx (HTML-aware Embedded Elixir), which gave Phoenix the foundation for rich view-layer tooling. Ruby lacked that HTML-aware template language -- until Herb.

### What Herb actually is

Herb (HTML + ERB) defines two things that didn't exist before: a formal syntax specifying how HTML and ERB interact, nest, and relate; and a grammar defining what constitutes valid HTML+ERB. With these in place, Herb provides a parser that produces a full syntax tree with hierarchy and context awareness.

For example, Herb understands that an `<% if %>` and `<% end %>` form a container node, with child HTML elements nested inside -- something no prior tool could represent. Because Herb integrates Prism for Ruby parsing, it validates both the HTML structure and the Ruby syntax in a single pass, catching missing closing tags, missing `end` keywords, and invalid Ruby before the app ever runs.

### The toolchain this unlocks

With one parser as the single source of truth, Herb powers an entire toolchain:

- **Language Server**: real-time diagnostics for missing tags, invalid ERB syntax, and invalid Ruby. Hover previews that show the HTML output of ActionView helpers like `tag.div`. Context-sensitive commenting, code folding aware of ERB structure, and autocomplete for Stimulus attributes within ERB helpers.
- **Linter**: rubocop-style rules for view files, with clickable links to documentation showing good and bad examples. It runs in the editor and on CI.
- **Formatter**: opinionated HTML+ERB formatting on save or via CLI, integrable into CI pipelines with a few lines of configuration.
- **Rendering Engine**: a drop-in replacement for Erubi that injects data attributes in development, enabling clickable overlays in the browser that jump directly to source files in the editor. It provides precise, line-and-column-level error messages instead of dumping the entire file.

The key insight Marco emphasized: integration beats collection. A single parser powering every tool -- editor, CI, runtime -- guarantees consistency. If your editor flags an error, it will also crash at runtime. No more guessing.

### The diffing engine and Reactive View

Marco then previewed something that got the room buzzing: the Herb diffing engine. It compares two versions of a parsed template and produces the minimal set of DOM operations needed to update the page. A live demo showed instant browser updates on file save -- no full page refresh, just surgical DOM patches.

This is the foundation for a larger vision called **Reactive View**: server-side reactivity inspired by Vue and StimulusReflex, where state changes on the server trigger targeted re-renders of only the affected template fragments -- without abandoning server rendering or adopting a SPA architecture. Marco also showed a render graph that traces partial dependencies across an entire Rails app, enabling detection of unused partials, cross-file diagnostics, and even scoping which tests need to rerun based on a template change.

And closing the loop on his original project: Stimulus LSP is now powered by Herb, meaning it works inside ERB tags and ActionView helpers with full autocomplete for controller names, actions, targets, and values.

---

## 2. Overreacting: From React to Hotwire

**Igor Aleksandrov @ Co-founder of Jet Rockets, Docker Captain**

If Marco's talk was about the foundational infrastructure Rails needs, Igor's was about the real-world cost of not having it -- and the pragmatic path back.

### Resume-Driven Development

Igor told the story of Safari Portal, a luxury travel itinerary builder that started in 2020 with React + Rails. The choice was defensible at the time: Rails 6 had just shipped, Turbo didn't exist yet (released December 2020), Hotwire hadn't been announced, and React was at its peak with mature tooling for complex UIs. The mistake, Igor argued, wasn't the initial choice. It was not reassessing as the landscape changed.

He coined the term "RDD" -- Resume-Driven Development -- to describe how individually reasonable technology choices (React, Redux, JSON API, full-ceremony frontend architecture) compound into an unsustainable tax on the team. The real cost was measured not in lines of code but in "internal mental energy": backend engineers struggling with Redux state management, frontend engineers unable to debug Rails behavior, and constant context-switching between two mental models. The app had grown to nearly 200,000 lines of code with a team of 12 to 20 developers.

Even early AI coding tools (circa 2023-2024) couldn't bridge this gap. As Igor put it, AI performs poorly across two poorly integrated systems.

### The trigger and the migration strategy

In June 2024, the client requested four major new features to transform the itinerary builder into a full-scale CRM -- with an aggressive timeline and limited budget. Meanwhile, other projects at Jet Rockets built entirely with Rails and Hotwire were shipping faster, and those teams appeared visibly happier.

Rather than a full rewrite, the team adopted a pragmatic coexistence approach:

- **Infrastructure simplification**: the React app was built as static files and placed into Rails' `public/` folder, served by Puma. A catch-all route at the bottom of the Rails routes file forwarded unmatched requests to a React controller. Two containers became one.
- **Shared authentication**: they adopted Rodauth as middleware. When a user signs in, they receive a cookie for Rails. For the React side, users are redirected through a special Rails controller that generates JWT tokens and pushes them to localStorage, giving React access without a separate auth flow.
- **React-in-Rails (Turbo Mount)**: for cases where React components were still needed inside Rails views, they used Marco Roth's Turbo Mount to render React components within Turbo frames, passing props from the server side.
- **Rails-in-React (iframes)**: for the reverse case, they used iframes. Since both apps share authentication, Rails views render seamlessly inside React pages, with Turbo navigation working correctly within the iframe boundary, managed by a custom Stimulus controller. As Igor said: "Do you see an iframe here? I don't. The user doesn't either."
- **Deployment with Kamal 2**: the CI/CD pipeline builds the React app first, pushes it to AWS, then copies the build artifacts into the Rails `public/react` folder inside the Docker image before deploying with Kamal 2.

### Results

The migration nearly doubled the number of pull requests closed per quarter. Building new features with Hotwire was faster. Team morale improved noticeably. Igor's framing was direct: Rails is a "one-person framework," and 90% of work consists of routine CRUD operations that don't require frontend framework complexity.

He also announced a new open-source UI component library built with ViewComponent and Stimulus -- heavily inspired by shadcn/ui but with ERB and Ruby flavors. It ships with 30+ components, AI-friendly YAML descriptions, pre-built pages, a VS Code extension, and a gem for quick integration. His call to the community was clear: invest in building the missing frontend libraries that currently only exist in the React ecosystem.

---

## Final thoughts: Rails is building its frontend story

These two talks weren't disconnected. They form a coherent narrative about where Rails is headed:

- **Herb** gives the view layer a formal grammar, unlocking the tooling (linting, formatting, language server, reactive rendering) that was previously impossible. It's the Prism equivalent for HTML+ERB.
- **Hotwire** (and the migration patterns Igor demonstrated) shows that you can move off React and back to a Rails monolith without a full rewrite -- and ship faster when you do.

The through-line is clear: Rails is no longer just investing in the backend. The frontend story -- the tooling, the libraries, the developer experience -- is getting the same level of attention. And unlike the JavaScript ecosystem, where the toolchain changes every two to three years, Rails is doing this with its signature emphasis on stability and backwards compatibility.

For me, these talks reinforced what we work toward every day at Jaya: helping teams choose the right frontend approach for where they are -- and giving them the tooling, conventions, and developer experience to keep shipping fast as they grow. For teams evaluating whether Rails can handle their frontend needs in 2026, the answer coming out of Tropical on Rails is increasingly: yes, and it's getting better fast.

## Want to explore this with us?

If you're working on Rails projects or want to bring these patterns into your organization, reach out to Jaya: https://en.jaya.tech/contact

And if you're a developer who wants to build this kind of work with us, check out our open roles: https://www.linkedin.com/company/jaya-tech/jobs/
