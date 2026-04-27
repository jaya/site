---
title: 'Rails Security in 2026: Passkeys, OWASP, and Privacy by Design'
description: 'Three talks from Tropical on Rails 2026 paint a clear picture of Rails security in 2026 — passwordless auth with passkeys, the OWASP Top 10 through a Rails lens, and privacy as an engineering discipline.'
pubDate: '2026-04-27'
author: 'Elias Sousa'
image: '/blog/tropical-on-rails-2026-rails-security-in-2026/cover.jpg'
tags: ['tech', 'rails', 'security', 'conferences', 'tropical_on_rails']
draft: false
---

Security in Rails has long been framed as "the framework has your back" -- secure defaults, escaped output, parameterized queries, CSRF tokens out of the box. But 2 billion leaked credentials in 2025, AI-powered phishing at machine speed, and tightening privacy regulations like LGPD and GDPR keep raising the bar for what "secure by default" actually means.

Tropical on Rails 2026 met that moment head-on. Three talks in particular, taken together, paint a coherent picture of what Rails security looks like right now.

> This post is part of a short series from Tropical on Rails 2026. Earlier entries covered [three talks on sustainable Rails engineering](/blog/tropical-on-rails-2026-3-talks-on-sustainable-rails) and [the new Rails frontend story](/blog/tropical-on-rails-2026-the-new-rails-frontend-story).

Braulio Martinez made the case for killing passwords with passkeys. Greg Molnar walked through the OWASP Top 10 with Rails-specific examples and real penetration testing stories. And Talysson de Oliveira Cassiano argued that privacy is not a legal checkbox but an engineering quality attribute, then showed exactly how to implement it.

Together, these three talks cover the full arc: authenticate users properly, defend against the most common vulnerabilities, and treat user data with the respect it deserves. Here is what I took away from each one.

---

## 1. Passkey Authentication on Rails

**Braulio Martinez @ Software Engineer and Co-founder at Zero Code**

Braulio opened Day 1 by framing a problem that keeps getting worse. In 2025, 2 billion credentials were leaked, and 70% of affected users had reused those credentials on other systems. Even two-factor authentication methods have significant gaps: SMS codes are vulnerable to SIM swapping, and TOTP apps can be compromised through QR code hijacking. A striking stat he shared: 90% of organizations by 2024 had suffered at least one phishing attack, with successful ones costing an average of nearly $5 million.

Then came the AI angle. What used to take weeks of human effort -- crafting convincing phishing emails, building fake login pages, running social engineering campaigns -- now happens at machine speed and scale. The fundamental weakness of every traditional authentication factor, Braulio argued, is that it relies on human judgment to detect fraud. In an AI-powered world, that is increasingly unreliable.

### WebAuthn and the road to passkeys

WebAuthn is the W3C standard developed by the FIDO Alliance that enables strong authentication using public-key cryptography. The architecture involves three entities: the **authenticator** (user's device or security key), the **client** (web browser), and the **relying party** (your Rails server). Credentials are public-private key pairs scoped to a specific origin, which means they cannot be phished -- a credential created for your domain simply will not work on a fake site.

Two ceremonies define the user flows: **attestation** (registration, where a new credential is created) and **assertion** (authentication, where a signed payload is verified against the stored public key). Both include challenge tokens to prevent replay attacks.

Early WebAuthn adoption hit two walls: credentials were locked to a single device, and losing that device meant losing account access. In May 2022, Apple, Google, and Microsoft -- through the FIDO Alliance -- introduced **passkeys**: WebAuthn credentials that are discoverable, syncable across devices via cloud services (iCloud Keychain, 1Password), and auto-fillable by password managers. Braulio acknowledged that syncing to the cloud is a security trade-off compared to hardware-bound keys, but argued it was the necessary compromise to achieve mass adoption -- and it remains vastly superior to passwords.

One important point: in a passkey ceremony, AI agents cannot impersonate users. The cryptographic verification is bound to a physical device and biometric confirmation. This is where the line gets drawn against AI-powered attacks.

### Implementation in Rails

The server-side verification for WebAuthn involves roughly 20 cryptographic steps. The `webauthn-ruby` gem (started around 2018, now at version 3) handles all of that. For **Devise** users, the `devise-passkeys` extension provides a generator, migration, and helpers for enrollment and authentication as both first and second factors. The setup is straightforward: install the gem, run the generator, migrate the database, configure the modules in your Devise model and initializer, and add three view helpers.

For **Rails 8 authentication**, there is a separate gem that works as a development dependency. And Braulio noted something worth watching: there is now an open pull request in Rails itself to add built-in passkey support. Rodauth has supported passkeys via `webauthn-ruby` for three to four years already.

### Real-world adoption

The adoption proof that hit hardest was from Brazil itself. In February 2025, the Central Bank mandated passkey usage for Pix (the national instant payment system) through the "Pix Jornada Sem Senha" initiative. Visa has also launched a system using passkeys to authorize bank transactions through payment processors. These are not experiments -- they are production systems handling real money at national scale.

---

## 2. Build Secure Rails Apps -- OWASP Top 10

**Greg Molnar @ Rails Security Consultant**

Greg took the stage on Day 2 and walked through the entire OWASP Top 10 (most recent update) from bottom to top, with Rails-specific code examples and stories from real penetration tests. The talk was packed with practical mitigations -- many of them low-effort, high-return.

### The stories that make it real

Two examples from Greg's pen testing experience:

The first: an e-commerce site where the shopping cart accepted negative quantities. The UI prevented it, but the raw HTTP request could be manipulated to set negative item quantities, reducing the cart total. Users could order products for free. The fix was a single line -- calling `.abs` on user-supplied numeric values at the server boundary. UI-only validations are trivially bypassed.

The second: a reporting feature that allowed users to specify columns for `SELECT` and `GROUP BY` clauses. The user-controlled values were interpolated directly into ActiveRecord query methods, enabling full SQL injection. The lesson: never pass user-controlled input into unsafe query methods like raw `select`, `group`, or `order` calls.

### The items that matter most for Rails developers

I will not walk through all ten, but here are the ones where Greg's Rails-specific advice was most actionable:

**Broken Access Control (#1)** -- The most common vulnerability. Beyond missing authorization entirely, the more frequent real-world issue is Insecure Direct Object References (IDOR): a controller permits a `company_id` parameter without verifying the current user belongs to that company. Greg also showed a privilege escalation bug where a user invitation endpoint permitted a `role` parameter, allowing a maintainer to invite themselves with a higher role. Always scope queries to the current user's permissions.

**Authentication (#7)** -- Greg demonstrated that a "must include uppercase, lowercase, digit, special character, 10+ characters" policy can be trivially satisfied by `Admin1234!`, which appears in every breached password database. His recommendation: replace character-based validation with a compromised password validator. The `pwned` gem validates passwords against the Have I Been Pwned database -- low effort, high return. He also flagged a Devise-specific pitfall: the default password reset flow automatically signs the user in, bypassing MFA. If you use `devise-two-factor`, you must customize the post-reset flow to enforce the second factor.

**Injection (#5)** -- Rails escapes output by default, but `link_to` remains a persistent XSS risk when the `href` parameter comes from user input (attackers can supply `javascript:` URI schemes). For command injection, Greg recommended the `terrapin` gem from thoughtbot for safe shell command execution.

**Failing open (#10)** -- A controller with an authorization before-action filter that rescues exceptions and only logs them -- without calling `render`, `redirect`, or `return false` -- lets the filter chain continue. If the authorization service is down, everything becomes publicly accessible. Use `except` instead of `only` for before-action declarations so new actions are secured by default.

### The tooling baseline

Greg made a strong case for a minimal security tooling setup that every Rails app should have: `brakeman` for static analysis (ships with Rails by default), `bundler-audit` for checking Gemfile.lock against known vulnerable gem versions, and `importmap:audit` or `yarn audit` for JavaScript dependencies. Run these in CI on every push and on a daily schedule against your main branch.

---

## 3. Privacy on Rails

**Talysson de Oliveira Cassiano @ Software Engineer at CodeMiner42**

Talysson opened with a scenario that should make any developer uncomfortable: you receive an email from a user requesting a full data export and account deletion. Would you know what tables to query? How to remove their data from log streams? What about queued jobs containing PII? How quickly must you respond? (Under LGPD, Brazil's privacy law: 15 days. Under GDPR: 30 days, extendable to 90.)

His core thesis: **privacy is an engineering quality attribute**, on par with security and performance. A good engineering team can be privacy-compliant without losing development momentum. Companies still fail because they treat privacy as purely a legal concern and prioritize innovation over user rights.

### Data minimization: less data, less risk

Talysson's practical strategies here were immediately applicable:

- **Strong Parameters** -- Be intentional about what fields you permit. Do not add fields "just in case." If you filter at the entry point, the rest of your application only handles data you explicitly chose to accept.
- **IP Anonymization** -- Handle this at the middleware level so the rest of the application never sees the full IP address. He recommended a gem from the Rack::Attack family that remains compatible with geocoding.
- **Explicit Serialization** -- When sending data to third parties, never rely on Active Record's default serialization. Create explicit permitted attribute lists so you control exactly what leaves your system.
- **No PII in logs or error tracking** -- Extend `config.filter_parameters` beyond the defaults. Use the `logstop` gem to scrub error objects before sending them to external services.
- **No PII in emails** -- Instead of embedding personal information in email bodies, send a link requiring sign-in. For downloadable files, use signed URLs with expiration dates via Rails' `MessageVerifier` API.
- **Retention policies** -- Schedule a recurring job to anonymize users inactive beyond a defined period. Make it automatic -- do not wait for a legal request.

### Private by default

Data should be protected without extra effort; extra effort should be required to _expose_ data.

**Active Record Encryption** was a centerpiece here. Talysson offered a clear decision framework: use **deterministic encryption** when you need to both decrypt and search a field (e.g., email); use **non-deterministic encryption** when you need to decrypt but not search (e.g., phone number); use **hashing** (like `has_secure_password`) when you only need to compare values without decryption.

He also called out production console access as a blind spot. Gems like `console1984` and `audits1984` log who accessed the console, when, and what commands they ran -- because even the best encryption does not help if someone can decrypt records from the console without any audit trail.

### Transparency and data rights

Consent goes far beyond cookie banners. Talysson demonstrated implementing a `Consent` model covering marketing, analytics, third-party sharing, and internal features. Each record captures purpose, version, IP address, and current status. A `before_action` check prevents actions when consent is missing, directing users to a dashboard where they can manage all permissions with a full audit trail.

For Data Subject Access Requests (DSARs), he showed a `DataRequest` model tracking request type (access, rectification, erasure) and status. Once an admin approves, a background job handles everything automatically using two reusable concerns: `DataExportable` (with an `exportable_fields` method on each model) and `Anonymizable` (which replaces PII with anonymous values while preserving database structure and foreign keys -- no need to delete rows).

### The Privacy by Design CLI

Talysson introduced an open-source CLI tool he built that audits an entire Rails codebase against privacy law compliance. It can run as a full audit or as a pre-push/pre-PR check. The output includes severity-ranked findings, a compliance checklist, suggested fixes, and an action plan. All scripts are written in Ruby so they can be audited before running against your codebase.

---

## A combined security checklist

These three talks together form a practical checklist for any Rails team that takes security seriously in 2026:

**Authentication**

- Add passkey support using `devise-passkeys` or the Rails 8 authentication gem
- Replace character-based password validation with the `pwned` gem
- Enforce MFA after password resets (Devise skips the second factor by default)
- Always call `reset_session` after successful login

**Application security**

- Use `except` instead of `only` for before-action authorization filters
- Scope all database queries to the current user's permissions to prevent IDOR
- Never interpolate user-controlled input into raw ActiveRecord query methods
- Validate server-side boundaries -- never trust UI-only validations
- Run `brakeman` and `bundler-audit` in CI on every push and daily on main

**Privacy**

- Extend `config.filter_parameters` to cover all application-specific PII
- Use Active Record Encryption with the right strategy per field
- Build consent as a first-class model with per-purpose, versioned, auditable records
- Automate DSARs using `DataExportable` and `Anonymizable` concerns
- Audit production console access with `console1984` and `audits1984`
- Implement automatic data retention policies with scheduled jobs

None of these items require a massive investment. Most are a gem install and a few lines of configuration. The common thread across all three talks was the same: Rails gives you the tools. The discipline is on you.

---

## Want to explore this with us?

If you're working on Rails projects or want to bring these patterns into your organization, reach out to Jaya: https://en.jaya.tech/contact

And if you're a developer who wants to build this kind of work with us, check out our open roles: https://www.linkedin.com/company/jaya-tech/jobs/
