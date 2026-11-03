import { render, screen } from "@testing-library/react";
import { WhereToWatch } from "./WhereToWatch";

it("labels external streaming links and opens them with safe new-tab attributes", () => {
  render(
    <WhereToWatch
      id={1}
      providers={[
        { name: "Crunchyroll", url: "https://www.crunchyroll.com/example" },
      ]}
    />,
  );
  const link = screen.getByRole("link", { name: /Crunchyroll/ });
  expect(link).toHaveAttribute("href", "https://www.crunchyroll.com/example");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(link).toHaveAccessibleName(/opens in a new tab/);
});
it("explains missing links and retains an AniList reference", () => {
  render(<WhereToWatch id={42} providers={[]} />);
  expect(
    screen.getByText(/has not provided streaming links/),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /View title on AniList/ }),
  ).toHaveAttribute("href", "https://anilist.co/anime/42");
});
