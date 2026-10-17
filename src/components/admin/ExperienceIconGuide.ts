"use client";

import { createElement, useState, type ChangeEvent } from "react";
import {
  EXPERIENCE_ICON_CATEGORIES,
  EXPERIENCE_ICON_OPTIONS,
  type ExperienceIconCode,
} from "../../lib/experience-icons.ts";

export function ExperienceIconGuide() {
  const [query, setQuery] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");

  const matchingIcons = EXPERIENCE_ICON_OPTIONS.filter((option) => {
    const category = EXPERIENCE_ICON_CATEGORIES.find(
      (item) => item.id === option.category,
    );
    return [option.code, option.label, category?.label ?? ""].some((value) =>
      value.toLocaleLowerCase("fr").includes(normalizedQuery),
    );
  });

  const copyCode = (code: ExperienceIconCode) => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setCopyStatus("Copie indisponible : sélectionnez le code manuellement.");
      return;
    }
    void navigator.clipboard.writeText(code).then(
      () => setCopyStatus(`Code copié : ${code}`),
      () => setCopyStatus("Copie impossible : sélectionnez le code manuellement."),
    );
  };

  return createElement(
    "aside",
    {
      "aria-labelledby": "experience-icon-guide-title",
      className:
        "mt-6 rounded-[18px] border border-[#B28A47]/18 bg-[#F7F3EB]/55 p-4 sm:p-5",
    },
    createElement(
      "div",
      { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between" },
      createElement(
        "div",
        null,
        createElement(
          "h3",
          {
            id: "experience-icon-guide-title",
            className: "font-serif text-lg font-medium text-[#2B1C17]",
          },
          "Guide des icônes",
        ),
        createElement(
          "p",
          { className: "mt-1 max-w-xl text-xs leading-5 text-[#6F625C]" },
          "Cliquez sur une icône pour copier son code, puis collez-le dans le champ icon correspondant.",
        ),
      ),
      createElement(
        "label",
        { className: "flex w-full flex-col gap-1 text-xs font-medium text-[#5D514C] md:max-w-[260px]" },
        "Rechercher une icône",
        createElement("input", {
          type: "search",
          value: query,
          onChange: (event: ChangeEvent<HTMLInputElement>) => {
            setQuery(event.target.value);
            setCopyStatus("");
          },
          placeholder: "Ex. cuisine, souk, spa…",
          className:
            "h-10 w-full rounded-xl border border-[#B28A47]/25 bg-white px-3 text-sm text-[#2B1C17] outline-none focus:border-[#0F5A46] focus:ring-2 focus:ring-[#0F5A46]/15",
        }),
      ),
    ),
    createElement(
      "div",
      { className: "mt-3 flex flex-wrap items-center justify-between gap-2" },
      createElement(
        "p",
        { className: "text-xs text-[#6F625C]" },
        `${matchingIcons.length} icônes disponibles sur ${EXPERIENCE_ICON_OPTIONS.length}`,
      ),
      createElement(
        "p",
        { className: "text-xs font-medium text-[#0F5A46]", role: "status", "aria-live": "polite" },
        copyStatus,
      ),
    ),
    matchingIcons.length === 0
      ? createElement(
          "p",
          { className: "mt-4 rounded-xl bg-white p-4 text-sm text-[#6F625C]" },
          "Aucune icône trouvée. Essayez un autre mot-clé.",
        )
      : EXPERIENCE_ICON_CATEGORIES.map((category) => {
          const options = matchingIcons.filter(
            (option) => option.category === category.id,
          );
          if (!options.length) return null;
          return createElement(
            "section",
            { key: category.id, className: "mt-5" },
            createElement(
              "h4",
              { className: "mb-2 text-xs font-semibold tracking-wide text-[#5D514C]" },
              category.label,
            ),
            createElement(
              "div",
              { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4" },
              options.map(({ code, label, icon: Icon }) =>
                createElement(
                  "button",
                  {
                    key: code,
                    type: "button",
                    onClick: () => copyCode(code),
                    "aria-label": `Copier le code ${code} (${label})`,
                    title: `Copier ${code}`,
                    className:
                      "flex min-w-0 items-center gap-2 rounded-xl border border-[#B28A47]/15 bg-white px-3 py-2.5 text-left text-[#0F5A46] transition hover:border-[#0F5A46]/35 hover:bg-[#0F5A46]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5A46]",
                  },
                  createElement(Icon, {
                    size: 19,
                    strokeWidth: 1.7,
                    className: "shrink-0",
                    "aria-hidden": true,
                  }),
                  createElement(
                    "span",
                    { className: "flex min-w-0 flex-col gap-0.5" },
                    createElement(
                      "span",
                      { className: "truncate text-[11px] font-medium text-[#5D514C]" },
                      label,
                    ),
                    createElement(
                      "code",
                      { className: "break-all text-[10px] font-semibold text-[#0F5A46]" },
                      code,
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
  );
}
