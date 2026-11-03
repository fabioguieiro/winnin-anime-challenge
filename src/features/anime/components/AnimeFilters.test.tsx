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
