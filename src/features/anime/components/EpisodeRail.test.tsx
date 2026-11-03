import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EpisodeRail } from "./EpisodeRail";
it("scrolls the list by a viewport and disables controls at its boundaries", async () => {
  const episodes = Array.from({ length: 3 }, (_, i) => ({
    title: `Episode ${i + 1}`,
    number: i + 1,
    url: `https://provider.test/${i}`,
    provider: "Provider",
    thumbnail: null,
  }));
  render(<EpisodeRail episodes={episodes} id={21} />);
  const row = screen.getByRole("list", { name: "Available episodes" });
  Object.defineProperty(row, "clientWidth", { configurable: true, value: 300 });
  Object.defineProperty(row, "scrollWidth", { configurable: true, value: 900 });
  const scroll = jest.fn(({ left }: { left: number }) => {
    row.scrollLeft = Math.max(0, Math.min(600, row.scrollLeft + left));
    fireEvent.scroll(row);
  });
  Object.defineProperty(row, "scrollBy", { configurable: true, value: scroll });
  fireEvent.scroll(row);
  const previous = screen.getByRole("button", { name: "Previous episodes" });
  const next = screen.getByRole("button", { name: "Next episodes" });
  expect(previous).toBeDisabled();
  expect(next).toBeEnabled();
  await userEvent.click(next);
  expect(row.scrollLeft).toBe(300);
  expect(previous).toBeEnabled();
  await userEvent.click(next);
  expect(row.scrollLeft).toBe(600);
  expect(next).toBeDisabled();
  await userEvent.click(previous);
  expect(row.scrollLeft).toBe(300);
  expect(next).toBeEnabled();
  expect(row).toHaveAttribute("tabindex", "0");
  expect(screen.getAllByRole("link")).toHaveLength(3);
});
