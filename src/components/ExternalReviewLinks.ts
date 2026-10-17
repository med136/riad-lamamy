import { createElement } from "react";

const reviewPlatforms = [
  { label: "Booking.com", href: "https://www.booking.com/" },
  { label: "Google", href: "https://www.google.com/" },
  { label: "TripAdvisor", href: "https://www.tripadvisor.fr/" },
  { label: "Airbnb", href: "https://www.airbnb.fr/" },
];

export function ExternalReviewLinks() {
  return createElement(
    "div",
    {
      className: "mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3",
      "aria-label": "Plateformes d’avis externes",
    },
    reviewPlatforms.map(({ label, href }) =>
      createElement(
        "a",
        {
          key: label,
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          className:
            "rounded-sm text-sm font-semibold tracking-[0.01em] text-[#201A17]/60 underline-offset-4 transition-colors hover:text-[#0F5A46] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47] focus-visible:ring-offset-4",
          "aria-label": `${label} — ouvrir dans un nouvel onglet`,
        },
        label,
      ),
    ),
  );
}
