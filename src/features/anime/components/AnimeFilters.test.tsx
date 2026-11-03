import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimeFilters } from "./AnimeFilters";

it("preserves input focus while syncing applied search and browser history", async () => {
  const onChange = jest.fn();
  const { rerender } = render(
    <AnimeFilters filters={{ search: "", format: "" }} onChange={onChange} />,
  );
  const input = screen.getByRole("searchbox");
  const user = userEvent.setup();
  await user.type(input, " Naruto ");
  await user.keyboard("{Enter}");
  expect(onChange).toHaveBeenCalledWith({ search: "Naruto", format: "" });
  rerender(
    <AnimeFilters
      filters={{ search: "Naruto", format: "" }}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole("searchbox")).toBe(input);
  expect(input).toHaveFocus();
  expect(input).toHaveValue("Naruto");
  rerender(
    <AnimeFilters filters={{ search: "", format: "" }} onChange={onChange} />,
  );
  expect(input).toHaveValue("");
  expect(input).toHaveFocus();
});

it("shows a pending search without replacing or disabling the focused input", async () => {
  const onChange = jest.fn();
  const filters = { search: "Naruto", format: "" } as const;
  const { rerender } = render(
    <AnimeFilters filters={filters} onChange={onChange} />,
  );
  const input = screen.getByRole("searchbox");
  await userEvent.click(input);
  rerender(<AnimeFilters filters={filters} onChange={onChange} pending />);
  expect(screen.getByRole("button", { name: "Searching..." })).toHaveAttribute(
    "aria-busy",
    "true",
  );
  expect(screen.getByRole("searchbox")).toBe(input);
  expect(input).toHaveFocus();
  expect(input).toBeEnabled();
  rerender(<AnimeFilters filters={filters} onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute(
    "aria-busy",
    "false",
  );
});
