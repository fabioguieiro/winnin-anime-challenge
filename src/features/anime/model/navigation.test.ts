import { getCatalogHref, getDetailsHref } from "./navigation";
it("preserves and encodes catalog filters in both directions", () => {
  const filters = { search: " A&B ", format: "MOVIE" } as const;
  expect(getDetailsHref(42, filters)).toBe(
    "/anime/42?search=A%26B&format=MOVIE",
  );
  expect(getCatalogHref(filters)).toBe("/?search=A%26B&format=MOVIE");
});
it("uses clean URLs when no filters are applied", () => {
  expect(getDetailsHref(42, { search: "", format: "" })).toBe("/anime/42");
  expect(getCatalogHref({ search: "", format: "" })).toBe("/");
});
