"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Direction = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";
const directions = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);
const selector = "a[href], button, input, select, textarea";

function editableOwnsArrow(element: HTMLElement, key: string) {
  if (element.isContentEditable || element.closest('[contenteditable="true"]'))
    return true;
  if (element.matches("textarea, select")) return true;
  return (
    element.matches("input") && (key === "ArrowLeft" || key === "ArrowRight")
  );
}

function distance(from: DOMRect, to: DOMRect, direction: Direction) {
  const horizontal = direction === "ArrowLeft" || direction === "ArrowRight";
  const forward = direction === "ArrowRight" || direction === "ArrowDown";
  const fromMain = horizontal
    ? from.left + from.width / 2
    : from.top + from.height / 2;
  const toMain = horizontal ? to.left + to.width / 2 : to.top + to.height / 2;
  const advance = (toMain - fromMain) * (forward ? 1 : -1);
  if (advance <= 1) return Infinity;
  const cross = horizontal
    ? Math.abs(to.top + to.height / 2 - (from.top + from.height / 2))
    : Math.abs(to.left + to.width / 2 - (from.left + from.width / 2));
  // Favor the same visual row/column over a closer diagonal control.
  const overlap = horizontal
    ? to.top < from.bottom - 1 && to.bottom > from.top + 1
    : to.left < from.right - 1 && to.right > from.left + 1;
  if (horizontal && !overlap) return Infinity;
  return advance + cross * (overlap ? 0.01 : 3) + (overlap ? 0 : 10000);
}

export function RemoteNavigation({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function navigate(event: KeyboardEvent) {
      const root = rootRef.current;
      if (
        !root ||
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !directions.has(event.key)
      )
        return;
      const active = document.activeElement;
      if (active instanceof HTMLElement && editableOwnsArrow(active, event.key))
        return;
      if (
        active !== document.body &&
        active !== document.documentElement &&
        active instanceof HTMLElement &&
        !root.contains(active)
      )
        return;
      const controls = [...root.querySelectorAll<HTMLElement>(selector)].filter(
        (element) => {
          const rect = element.getBoundingClientRect();
          return (
            element.tabIndex >= 0 &&
            !element.matches(":disabled, [aria-disabled='true']") &&
            !element.closest("[hidden], [inert], [aria-hidden='true']") &&
            getComputedStyle(element).visibility !== "hidden" &&
            rect.width > 1 &&
            rect.height > 1
          );
        },
      );
      let next: HTMLElement | undefined;
      if (!(active instanceof HTMLElement) || !root.contains(active)) {
        next =
          controls.find((element) => element.closest("main")) ?? controls[0];
      } else {
        const origin = active.getBoundingClientRect();
        let best = Infinity;
        for (const element of controls) {
          if (element === active || element.contains(active)) continue;
          const score = distance(
            origin,
            element.getBoundingClientRect(),
            event.key as Direction,
          );
          if (score < best) {
            best = score;
            next = element;
          }
        }
      }
      // At a boundary, keep focus in place instead of scrolling the page away.
      event.preventDefault();
      if (next) {
        next.focus({ preventScroll: true });
        next.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "instant",
        });
      }
    }
    document.addEventListener("keydown", navigate);
    return () => document.removeEventListener("keydown", navigate);
  }, []);
  return <div ref={rootRef}>{children}</div>;
}
