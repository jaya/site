---
title: 'What Building Open Note Taught Me About Specification-Driven Development with AI'
description: 'A practical reflection on building Open Note, a Linux-first note-taking app, and the lessons I learned about specification-driven development, workflows, skills, and AI-assisted engineering.'
pubDate: '2026-03-11'
author: 'leco'
image: '/blog/specification-driven-development/open-note-specification.png'
tags: ['Tech', 'AI', 'Rust', 'Open_Source', 'Linux', 'AI_assisted_engineering', 'Specification_Driven_Development']
draft: false
---

## What Building Open Note Taught Me About Specification-Driven Development with AI

About two years ago, I decided to study Rust.

I like keeping this habit of picking one programming language each year and spending real time with it. Back then, Rust was the candidate. There were many things I liked about it, a few that I did not enjoy as much, but in the end, I never really built anything concrete with what I had studied.

That changed when I started reading *Beyond Vibe Coding*.

The book pushed me to think about something that tends to come naturally once you have spent enough time building software: before jumping into implementation, you start thinking about structure, boundaries, base files, phases, and the small details that shape a project. In other words, you start leaning toward a more specification-driven way of building.

That was the context in which **Open Note** was born.

Instead of keeping Rust as just another language I had studied, I wanted to use it in something real — something I could actually use in my day-to-day life.

## The Problem Was Real

At the time, I was changing my development environment, and one thing that kept bothering me was my note-taking setup.

I was already used to tools like Notion and GoodNotes, which I rely on quite often. Linux has good tools, of course, but not always in the same direction or with the same kind of experience I was already used to.

So I thought: instead of just looking for a replacement, why not build one?

That was the starting point for **Open Note**, an open source project designed first with Linux in mind — a Linux-first application that came from a real need and became, at the same time, a learning project.

If you want to check out the repository, it is here:  
[Open Note on GitHub](https://github.com/l3co/open-note)

And if you want a quick overview of the app itself, especially its features, this page gives a good summary:  
[Open Note Features](https://l3co.github.io/open-note/#features)

## The Process Was as Valuable as the Product

To be honest, the development process became one of the most interesting parts of the whole experience.

I was not only writing code. I was also experimenting with tools, workflows, and different ways of working with AI. Since I was relying heavily on free plans, I had to be careful with token usage, and that ended up teaching me more than I expected.

I used **Cloud Code** a lot for planning, prototyping, and refining specifications and supporting documents. For implementation, I often alternated between **Codex** and **Gemini Anti-Gravity**, mostly because those were the tools that gave me more room to experiment without immediately hitting limits.

In practice, the project lived somewhere between **pair programming** and **AI-orchestrated development**.

And I think that distinction matters.

A lot of people talk about AI development as if the whole thing were almost automatic. That was not my experience. In practice, it required thought, planning, restructuring context, managing trade-offs, reviewing output, and deciding carefully where each tool actually helped.

## What Open Note Taught Me About Specification-Driven Development

As I worked on Open Note, a few lessons became very clear to me.

### 1. Think in Phases

This was probably the most important one.

When you work with specifications, trying to describe everything at once usually makes the process worse. Huge files become tiring to maintain, harder to reason about, and depending on the platform, they also increase context consumption in ways that are not always worth it.

What worked much better for me was breaking the project into smaller phases, each with a clear goal.

It is a bit like building a house. You do not start with every detail of the final decoration. You begin with the foundation, then the structure, then the systems, and only later the finishing touches. Trying to fit everything into one giant plan makes confusion much more likely.

### 2. Avoid Giant Specification Files

This connects directly to the first point.

It is not enough to think in phases; you also need to split the documents well. The clearer and more modular your specification is, the better the implementation tends to go — especially when you do not know for sure which model, IDE, or agent will be executing that plan later.

That matters because the executor is not always the tool you originally had in mind.

Sometimes you write a plan with one platform in mind and end up executing it with another. If your documentation is too large, too tangled, or too dependent on a specific context window, it becomes fragile.

Smaller, focused, well-separated documents survive tool changes much better.

### 3. Token Economy Is Also a Design Concern

This was one of the most practical lessons.

Some tools and platforms are simply better at handling context efficiently. Systems that rely on retrieval or more selective context loading tend to avoid rereading everything all the time, and that makes a real difference.

When you are working with limited usage, token economy stops being just a cost issue and becomes part of how you design the development process itself.

In a way, organizing documents, reducing unnecessary repetition, and structuring information for reuse becomes another layer of architecture.

## 4. Not Everything Needs to Go Through an Orchestrator

Another thing I noticed is that not every step needs to be routed through an orchestration layer.

An orchestrator can be useful. It can help connect planning and execution, coordinate tasks, and provide consistency. But it also consumes tokens, and sometimes quite a lot of them, without directly writing any meaningful code.

Because of that, I found it useful to offload some steps to simpler CLIs or narrower flows whenever possible.

Not every problem benefits from an extra layer of intelligence in the middle. Sometimes the shortest path is the best one.

### 5. Separate Context by System Area

This became almost a rule for me.

If a project involves frontend, backend, and mobile, those contexts should be separated. One context for frontend, another for backend, another for mobile.

Putting everything together may feel convenient at first, but in practice it creates confusion. Responsibilities get mixed, suggestions bleed across layers, and the output becomes less reliable.

Keeping contexts separate helps the tool, but it also helps the developer think more clearly.

### 6. Work in Phases and Commit Often

This is not new advice in software engineering, but it became even more important in this kind of workflow.

Frequent commits, organized by feature, phase, or responsibility, are extremely helpful. They keep the project understandable, reduce the blast radius of mistakes, and make it easier to recover when something goes wrong.

When AI is part of the process, this matters even more, because it helps you isolate what changed, review output with more confidence, and avoid relying on one giant fragile stream of context.

## Workflows and Skills Are Useful — but Only with Intent

One of the most interesting parts of this experience was experimenting more seriously with workflows and skills.

I found it useful to think in terms of dedicated workflows for specific kinds of work: planning workflows, commit workflows, bug-fix workflows, implementation workflows, and review workflows.

That kind of separation creates a more predictable process.

Depending on the platform, you can also define which skills should be used inside certain workflows, or let the system decide based on what is installed.

Still, I think this is a place where restraint matters.

Personally, I do not like keeping every possible skill active all the time. I actually think that is risky. The more permissions, integrations, and automated capabilities you leave open by default, the greater the chance of confusion, unintended behavior, or poor boundaries.

For people interested in exploring that ecosystem, this repository is a very interesting reference point:  
[Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills)

But my overall takeaway is simple: workflows and skills are helpful when used deliberately, not just because they exist.

## The Biggest Win Was Building Something Real

More than studying Rust, more than testing AI tools, more than experimenting with workflows, what really mattered was building something concrete.

Open Note came from a real problem. That changed the whole experience.

It stopped being just an academic exercise or a technical curiosity and became the meeting point between study, utility, and actual software creation.

And for anyone exploring specification-driven development, that may be the most useful advice I can offer: try applying it to something you would genuinely use.

When the project has real purpose, the learning becomes much more grounded.

## Wrapping Up

I am still learning a lot about this way of building. I am sure that over time I will have more mature lessons to share, especially around workflows, skills, orchestration, and how to balance AI speed with software discipline.

But for now, these were some of the clearest lessons I took from building Open Note.

If I had to summarize them simply, I would say this: think in phases, split specifications carefully, separate contexts, use orchestration only where it truly helps, and do not abandon good engineering habits just because AI is now part of the process.

In the end, the fundamentals still matter.

And maybe that is one of the most important lessons in this new phase of software development.