import { createElement, type ReactNode } from "react";

type RoomGridProps = {
  children: ReactNode;
};

export function RoomGrid({ children }: RoomGridProps) {
  return createElement(
    "div",
    { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" },
    children,
  );
}
