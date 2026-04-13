---
title: 'Tropical on Rails 2026: 3 Talks on Sustainable Rails Engineering'
description: 'Three standout talks from Tropical on Rails 2026 — on containerized dev environments, production data safety, and the architecture that takes a Rails app from launch to long-term growth.'
pubDate: '2026-04-13'
author: 'Elias Sousa'
image: '/blog/tropical-on-rails-2026-3-talks-on-sustainable-rails/cover.jpg'
tags: ['tech', 'rails', 'conferences', 'tropical_on_rails']
draft: false
---

On April 9-10, Jaya brought its Ruby development team to Tropical on Rails 2026 in São Paulo -- part of our continuous investment in growing and sharpening the people behind the code. Among 13 talks, three stood out -- not because they covered the flashiest topics, but because they addressed something I think about constantly: **what does it take to keep a Rails app healthy over time?**

Setting up a new developer in minutes instead of days. Handling production data without breaking things at 2 AM. Evolving a codebase from MVP to something that can sustain real growth. These are the problems that separate teams who ship fast from teams who ship fast _and_ keep shipping.

Here's what I took away from each one.

---

## 1. Unboxing Devcontainers and Docker for Rubyists

**Rachael Wright-Munn @ Coding Content Producer**

Rachael opened her talk by running a full Rails app -- tests, dev server, everything -- inside a browser-based codespace. No local setup. No "works on my machine." Just open and go.

Then she spent the rest of the talk showing us how to get there, layer by layer.

### Three layers, one breakthrough

The talk walked through the three files that power a containerized Rails dev environment:

**Layer 1 -- Dockerfile.** You build an image, run your app inside it. It works, but it's painful. Every `bundle install` is lost when the container stops. Any gem change means a full image rebuild -- 116.8 seconds in her demo. You're constantly typing verbose `docker run` commands with volume mounts and port flags.

**Layer 2 -- Docker Compose.** Now you can coordinate services -- Rails, Redis, Selenium for system tests -- with a single file. Running tests gets shorter, but you're still prefixing everything with `docker compose run --rm`. And the rebuild problem remains: change a gem, rebuild the image.

**Layer 3 -- devcontainer.json.** This is where everything clicks. The key idea: open your editor _inside_ the container. Once VS Code (or IntelliJ, or Neovim) runs inside the container, extensions like [Ruby LSP](https://github.com/Shopify/ruby-lsp) and [StandardRB](https://github.com/standardrb/standard) just work -- they have direct access to Ruby and all installed gems. Running tests becomes `bin/rails test`. Running `bundle install` is just `bundle install`. No prefixes, no rebuilds, because you're in a single persistent container.

Since Rails 7.2, `rails new --devcontainer` generates all three files as a starting point. One command, and a new hire gets the same dev environment as a senior engineer.

### Key insights

Your first devcontainer will probably have issues. But because it's shared and automated, people actually fix it. She pointed out that teams tolerate humans struggling with setup docs but fix things when robots struggle -- and the same dynamic applies here.

She also clarified that Dev Containers aren't VS Code-only. They work with IntelliJ, Vim, Neovim, and Cursor. Docker Desktop can be replaced with Colima or OrbStack. And GitHub Codespaces supports them natively -- which is how she opened the talk.

In a world where AI agents are increasingly writing and running code, devcontainers take on new importance. They provide a sandboxed, reproducible environment where agents can execute non-interactive workflows safely -- running tests, installing dependencies, spinning up services -- without touching the host machine. The same setup that onboards a human developer in minutes can onboard an AI agent in seconds.

---

## 2. Production Data Doesn't Have to Be Scary

**Matheus Richard @ Thoughtbot**

Matheus structured his talk around three cautionary stories -- each exposing a different way production data bites you, each introducing specific tools to prevent it.

### Story 1: Data size matters

A team adds a `sent_at` column to notifications and writes a migration to backfill millions of records. It times out mid-deploy. Worker servers are running the new code while the web server still lacks the column. Cascading failures at 2 AM.

The fix: never bundle schema changes, data migrations, and new behavior in a single deploy. Split them. First add the column, then backfill independently, then deploy the new code.

Matheus introduced **[data_customs](https://github.com/thoughtbot/data_customs)**, a gem he created for data migrations. What sets it apart is a built-in `verify!` method -- if verification fails, the entire migration rolls back, leaving data in a known-good state.

```ruby
class BackfillSentAt < DataCustoms::Migration
  def up
    Notification.where(sent_at: nil).update_all("sent_at = created_at")
  end

  def verify!
    if Notification.exists?(sent_at: nil)
      raise "Some notifications still have no sent_at!"
    end
  end
end
```

### Story 2: Data shape matters

A forum app lets users delete accounts, but their comments remain with stale foreign keys pointing to non-existent records. The `user_id` isn't nil -- it just references a row that no longer exists. Factory-based tests never catch this because test data is always perfectly consistent.

This is where [data_customs](https://github.com/thoughtbot/data_customs)' verification shines: you verify the _outcome_ from a different angle, catching what tautological tests miss. Matheus then introduced **[evil-seed](https://github.com/evilmartians/evil-seed)**, a gem for creating anonymized production database dumps. It traces associations from a root model, excludes sensitive data, anonymizes attributes with Faker, and gives you a SQL file with realistic data for local development.

```ruby
EvilSeed.configure do |config|
  config.root("Forum", featured: true) do |root|
    root.limit(100)
    root.exclude(/\bsessions\b/)
    root.limit_associations_size(5, "forum.comments")
  end

  config.anonymize("User") do
    name  { Faker::Name.name }
    email { Faker::Internet.email }
  end
end

EvilSeed.dump("seed.sql")
```

### Story 3: Data needs boundaries

The third story is about PII leaking to external services -- logging platforms, analytics, LLM integrations. This can violate LGPD, GDPR, or HIPAA.

**[Top Secret](https://github.com/thoughtbot/top_secret)** filters PII from free text before it leaves your application. It uses regex-based detection for structured data (emails, phone numbers, credit cards) and **[MiTIE](https://github.com/mit-nlp/MITIE)** (an MIT ML library) for context-aware detection of names and places. Particularly useful for LLM integrations: scrub user messages before they reach the model, restore original values in the response.

```ruby
user_message = "Contact Ralph at ralph@thoughtbot.com about the Boston project"
result = TopSecret::Text.filter(user_message)

result.output
# => "Contact [PERSON_1] at [EMAIL_1] about the [LOCATION_1] project"

# Send filtered text to LLM, then restore original values in the response
llm_response = call_llm_api(result.output)
restored = TopSecret::FilteredText.restore(llm_response, mapping: result.mapping)
```

### Bonus tools

Matheus also covered **[strong_migrations](https://github.com/ankane/strong_migrations)** (a linter for dangerous schema changes), **[Blazer](https://github.com/ankane/blazer)** (SQL-based production data exploration with scheduled checks), and **[console1984](https://github.com/basecamp/console1984)** (production console access control with encrypted data enforcement and full audit trails via **[audits1984](https://github.com/basecamp/audits1984)**).

**Key takeaway:** Rails gives users great tools for managing data (forms, params, controllers, models) but developers managing production data are often flying blind. These gems fill that gap.

---

## 3. Keynote: From One to Two

**Vladimir Dementyev @ Evil Martians**

Dementyev closed the conference with a keynote that tied everything together. The premise: the codebase that got your product to launch ("point one") is not the codebase that will sustain real growth ("point two"). The transition between these two points is the most critical -- and most neglected -- phase of a product's life.

### The space analogy

He drew a parallel to space exploration. Point zero is the theory (the rocket equation). Point one is Sputnik -- proving you can reach orbit. Point two is Vostok -- putting a human in space _and bringing them back alive_. The rocket barely changed, but everything around it did: life support, recovery, redundancy, mission control.

The same applies to software: the Rails app that proves your idea works is not the one that handles real users, real money, and real incidents. Closing that gap is what "one to two" means.

### Software Product Fit

Dementyev introduced the concept of **Software Product Fit (SPF)** -- how well your software adapts to growing product demands. When the product outgrows the code, a dangerous gap emerges: every feature gets more expensive, every incident takes longer to recover from, every new hire takes longer to onboard. SPF is the discipline of closing that gap incrementally, not through rewrites.

### AI as an amplifier

The talk's sharpest insight was about AI. Dementyev reproduced the same feature using AI on two branches: one with vanilla controllers, one with the filter object layer. Both produced working code. But the vanilla version contained "mistakes" -- working but inappropriate code, like unnecessary joins and case statements. The layered version produced a single-line addition.

His conclusion: **AI amplifies whatever architecture you have.** Good conventions produce better AI-generated code. Bad architecture produces technical debt faster than any human could. He proposed that the traditional pattern hierarchy (idioms → design patterns → architectural patterns) now has a new layer: **AI orchestration patterns** -- the skills, rules, and guardrails that guide AI agents.

He also published a new version of his **[Gemfile of Dreams](https://evilmartians.com/chronicles/gemfile-of-dreams-libraries-we-use-to-build-rails-apps)** -- a curated reference of trusted gems -- and recommended pointing AI agents at high-quality reference codebases rather than letting them reinvent solutions.

---

## Final thoughts

- Rachael showed that a push-button dev environment isn't a luxury -- it's how you keep velocity when the team grows and how you give AI agents a safe, reproducible workspace to operate in.
- Matheus showed that production data will surprise you, and the right gems can turn scary operations into safe, verifiable workflows.
- Dementyev showed that architecture isn't an upfront exercise -- it's an ongoing discipline, one bug fix and one convention at a time.

For me, these talks reinforced what we work toward every day at Jaya: the practices that enable both teams and AI agents to deliver fast with quality -- the dev setup, the data safety nets, the architectural conventions -- are exactly what we continuously help our developers and clients build and sustain.

## Want to explore this with us?

If you're working on Rails projects or want to bring these patterns into your organization, reach out to Jaya: https://en.jaya.tech/contact

And if you're a developer who wants to build this kind of work with us, check out our open roles: https://www.linkedin.com/company/jaya-tech/jobs/
