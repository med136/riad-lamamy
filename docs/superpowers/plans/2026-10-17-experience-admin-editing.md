# Experience Admin Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all Experience section content, including icon codes, editable in the admin and provide an inline icon-code guide.

**Architecture:** Add a typed, shared icon registry used by both the public Experience renderer and the admin guide. Store all copy and icon codes through the existing translation CMS keys under `home.experience.`, so the existing secured admin API persists them without a schema change.

**Tech Stack:** Next.js, React, TypeScript, Lucide React, Node test runner, Supabase-backed CMS translations.

**Spec:** `docs/superpowers/specs/2026-10-17-experience-admin-editing.md`

## Global Constraints

- Preserve the existing public layout and animations.
- Keep all new CMS keys below `home.experience.`.
- Use only the eight icon codes defined in the spec guide; unknown or empty values must render a safe fallback.
- Do not add a database migration.

## Review Focus

- Icon codes with whitespace or uppercase resolve predictably.
- Empty and unknown icon codes never break the public section.
- All four moments expose time, title, description and icon fields.
- French and English base catalogs contain the same keys.
- The admin guide displays every accepted code exactly once.

---

### Task 1: Shared Experience icon registry

**Files:**
- Create: `src/lib/experience-icons.ts`
- Test: `src/lib/experience-icons.test.ts`

**Interfaces:**
- Produces: `EXPERIENCE_ICON_OPTIONS` and `getExperienceIconOption(code, fallbackCode?)`.

- [ ] Write tests for supported codes, normalization, empty values and unknown-code fallback.
- [ ] Run the targeted test and confirm it fails because the registry does not exist.
- [ ] Implement the typed icon registry and resolver.
- [ ] Run the targeted test and confirm it passes.

### Task 2: Dynamic Experience content

**Files:**
- Modify: `src/lib/i18n.ts`
- Modify: `src/components/Experience.tsx`

**Interfaces:**
- Consumes: `getExperienceIconOption` from Task 1.
- Produces: four rendered moments sourced entirely from `home.experience.*` translation keys.

- [ ] Add matching French and English keys for every moment’s time, title, description and icon.
- [ ] Replace hardcoded Experience values with translated values and resolved icons.
- [ ] Run type checking to prove both language catalogs and component keys agree.

### Task 3: Admin icon-code guide

**Files:**
- Create: `src/components/admin/ExperienceIconGuide.ts`
- Test: `src/components/admin/ExperienceIconGuide.test.ts`
- Modify: `src/app/admin/contenu/[pageKey]/page.tsx`

**Interfaces:**
- Consumes: `EXPERIENCE_ICON_OPTIONS` from Task 1.
- Produces: `ExperienceIconGuide`, rendered below the Experience translation form only.

- [ ] Write a static-render test asserting all eight icon codes are shown.
- [ ] Run the targeted test and confirm it fails because the guide does not exist.
- [ ] Implement the compact accessible guide and mount it for the home Experience section.
- [ ] Run the targeted test and confirm it passes.

### Task 4: Integrated verification

**Files:**
- Verify all files changed by Tasks 1–3.

**Interfaces:**
- Consumes: completed public renderer and admin editor.
- Produces: verified build-ready behavior.

- [ ] Run targeted tests, the full Node test set, TypeScript, relevant lint and production build.
- [ ] Inspect the home page to confirm four Experience moments still render with icons and content.
- [ ] Review the final diff for unrelated changes and report pre-existing warnings separately.

