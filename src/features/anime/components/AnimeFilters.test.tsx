import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnimeFilters } from "./AnimeFilters";

it("preserves input focus while syncing applied search and browser history", async () => {
  const onChange = jest.fn();
  const { rerender } = render(
    <AnimeFilters
      filters={{ search: "", format: "", sort: "popularity" }}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole("searchbox");
  const user = userEvent.setup();
  await user.type(input, " Naruto ");
  await user.keyboard("{Enter}");
  expect(onChange).toHaveBeenCalledWith({
    search: "Naruto",
    format: "",
    sort: "popularity",
  });
  rerender(
    <AnimeFilters
      filters={{ search: "Naruto", format: "", sort: "popularity" }}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole("searchbox")).toBe(input);
  expect(input).toHaveFocus();
  expect(input).toHaveValue("Naruto");
  rerender(
    <AnimeFilters
      filters={{ search: "", format: "", sort: "popularity" }}
      onChange={onChange}
    />,
  );
  expect(input).toHaveValue("");
  expect(input).toHaveFocus();
});

it("shows a pending search without replacing or disabling the focused input", async () => {
  const onChange = jest.fn();
  const filters = { search: "Naruto", format: "", sort: "popularity" } as const;
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

it("changes sorting without losing filters and follows history updates", async () => {
  const onChange = jest.fn();
  const filters = {
    search: "Naruto",
    format: "TV",
    sort: "popularity",
  } as const;
  const { rerender } = render(
    <AnimeFilters filters={filters} onChange={onChange} />,
  );
  const select = screen.getByRole("combobox", { name: "Sort by" });
  await userEvent.selectOptions(select, "score");
  expect(onChange).toHaveBeenCalledWith({ ...filters, sort: "score" });
  rerender(
    <AnimeFilters
      filters={{ ...filters, sort: "score" }}
      onChange={onChange}
    />,
  );
  expect(select).toHaveValue("score");
  await userEvent.click(screen.getByRole("button", { name: "Movie" }));
  expect(onChange).toHaveBeenLastCalledWith({
    search: "Naruto",
    format: "MOVIE",
    sort: "score",
  });
  await userEvent.type(screen.getByRole("searchbox"), " Shippuden{Enter}");
  expect(onChange).toHaveBeenLastCalledWith({
    search: "Naruto Shippuden",
    format: "TV",
    sort: "score",
  });
  rerender(<AnimeFilters filters={filters} onChange={onChange} />);
  expect(select).toHaveValue("popularity");
});
