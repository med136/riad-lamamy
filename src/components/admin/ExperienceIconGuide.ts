import { createElement } from "react";

import { EXPERIENCE_ICON_OPTIONS } from "../../lib/experience-icons.ts";

export function ExperienceIconGuide() {
  return createElement(
    "aside",
    {
      "aria-labelledby": "experience-icon-guide-title",
      className:
        "mt-6 rounded-[18px] border border-[#B28A47]/18 bg-[#F7F3EB]/55 p-4 sm:p-5",
    },
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
      { className: "mt-1 text-xs leading-5 text-[#6F625C]" },
      "Copiez exactement un de ces codes dans le champ icon correspondant.",
    ),
    createElement(
      "div",
      { className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" },
      EXPERIENCE_ICON_OPTIONS.map(({ code, icon: Icon }) =>
        createElement(
          "div",
          {
            key: code,
            className:
              "flex items-center gap-2 rounded-xl border border-[#B28A47]/15 bg-white px-3 py-2.5 text-[#0F5A46]",
          },
          createElement(Icon, {
            size: 17,
            strokeWidth: 1.7,
            "aria-hidden": true,
          }),
          createElement(
            "code",
            { className: "text-[11px] font-semibold text-[#5D514C]" },
            code,
          ),
        ),
      ),
    ),
  );
}

