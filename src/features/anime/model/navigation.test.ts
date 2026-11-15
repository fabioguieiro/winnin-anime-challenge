import { getCatalogHref, getDetailsHref } from "./navigation";
it("preserves and encodes catalog filters in both directions", () => {
  const filters = {
    search: " A&B ",
    format: "MOVIE",
    sort: "popularity",
  } as const;
  expect(getDetailsHref(42, filters)).toBe(
    "/anime/42?search=A%26B&format=MOVIE",
  );
  expect(getCatalogHref(filters)).toBe("/?search=A%26B&format=MOVIE");
});
it("uses clean URLs when no filters are applied", () => {
  expect(
    getDetailsHref(42, { search: "", format: "", sort: "popularity" }),
  ).toBe("/anime/42");
  expect(getCatalogHref({ search: "", format: "", sort: "popularity" })).toBe(
    "/",
  );
});

it("preserves score sorting in detail and return links", () => {
  const filters = { search: "Naruto", format: "TV", sort: "score" } as const;
  expect(getDetailsHref(42, filters)).toBe(
    "/anime/42?search=Naruto&format=TV&sort=score",
  );
  expect(getCatalogHref(filters)).toBe("/?search=Naruto&format=TV&sort=score");
});
