import { fireEvent, render, screen } from "@testing-library/react";
import { WhereToWatch } from "./WhereToWatch";

it("labels external streaming links and opens them with safe new-tab attributes", () => {
  render(
    <WhereToWatch
      id={1}
      providers={[
        {
          name: "Crunchyroll",
          url: "https://www.crunchyroll.com/example",
          icon: "https://s4.anilist.co/logo.png",
          color: "#F88B24",
        },
      ]}
    />,
  );
  const link = screen.getByRole("link", { name: /Crunchyroll/ });
  expect(link).toHaveAttribute("href", "https://www.crunchyroll.com/example");
  expect(link.querySelector("img")).toHaveAttribute(
    "src",
    "https://s4.anilist.co/logo.png",
  );
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

it("keeps named links usable when a provider logo is absent or fails", () => {
  render(
    <WhereToWatch
      id={1}
      providers={[
        {
          name: "Known service",
          url: "https://example.com/known",
          icon: "https://images.test/logo.png",
          color: null,
        },
        {
          name: "Other service",
          url: "https://example.com/other",
          icon: null,
          color: null,
        },
      ]}
    />,
  );
  const known = screen.getByRole("link", { name: /Known service/ });
  fireEvent.error(known.querySelector("img")!);
  expect(known).toHaveTextContent("Known service");
  expect(known.querySelector("img")).toBeNull();
  expect(screen.getByRole("link", { name: /Other service/ })).toHaveTextContent(
    "Other service",
  );
});
