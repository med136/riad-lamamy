# Experience Section Admin Editing Spec

## Goal

Make every visible element of the home-page “L’expérience Dar LaMamy” section editable from the existing admin content editor.

## Requirements

- Keep the existing public design and its four experience moments.
- Make the section kicker, title fragments, introduction and closing text editable in French and English.
- Make each moment’s time, title, description and icon code editable in French and English.
- Accept a small, documented set of Lucide icon codes and render a safe fallback for an unknown or empty code.
- Show a compact icon guide grid below the Experience admin form, with each available icon and its exact code.
- Reuse the existing `cms_translations` API and `home.experience.` catalog prefix; no new database table or migration.

## Icon Codes

`sunrise`, `compass`, `coffee`, `moon`, `star`, `heart`, `map-pin`, `sparkles`.

