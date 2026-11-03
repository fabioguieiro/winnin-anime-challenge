import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrailerPlayer } from "./TrailerPlayer";
const trailer = {
  url: "https://www.youtube.com/watch?v=LHtdKWJdif4",
  provider: "YouTube",
  thumbnail: "https://i.ytimg.com/vi/LHtdKWJdif4/hqdefault.jpg",
};
it("loads a YouTube iframe only after user action and stops/unmounts it when closed", async () => {
  const { container } = render(
    <TrailerPlayer trailer={trailer} title="Attack on Titan" />,
  );
  const play = screen.getByRole("button", {
    name: "Reproduzir trailer de Attack on Titan",
  });
  expect(container.querySelector("iframe")).not.toBeInTheDocument();
  await userEvent.click(play);
  const frame = screen.getByTitle("Trailer de Attack on Titan");
  expect(frame).toHaveAttribute(
    "src",
    expect.stringContaining(
      "https://www.youtube-nocookie.com/embed/LHtdKWJdif4?",
    ),
  );
  expect(frame).toHaveAttribute(
    "referrerpolicy",
    "strict-origin-when-cross-origin",
  );
  expect(frame).toHaveFocus();
  expect(
    screen.getByRole("link", { name: /Abrir no YouTube/ }),
  ).toHaveAttribute("href", trailer.url);
  await userEvent.click(screen.getByRole("button", { name: "Fechar trailer" }));
  expect(container.querySelector("iframe")).not.toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "Reproduzir trailer de Attack on Titan",
      }),
    ).toHaveFocus(),
  );
});
it("keeps unsupported providers as external links instead of embedding arbitrary URLs", () => {
  const { container } = render(
    <TrailerPlayer
      trailer={{
        ...trailer,
        url: "https://www.dailymotion.com/video/x123abc",
        provider: "Dailymotion",
      }}
      title="Anime"
    />,
  );
  expect(
    screen.getByRole("link", { name: /Assistir ao trailer em Dailymotion/ }),
  ).toHaveAttribute("target", "_blank");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(container.querySelector("iframe")).not.toBeInTheDocument();
});
