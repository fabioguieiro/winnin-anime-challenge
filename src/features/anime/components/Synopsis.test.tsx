import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Synopsis } from "./Synopsis";
it("lets users expand and collapse the complete synopsis without losing focus", async () => {
  const text = "The full story. ".repeat(40);
  render(<Synopsis id={21} text={text} />);
  const user = userEvent.setup();
  const button = screen.getByRole("button", { name: "Read full synopsis" });
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(button).toHaveAttribute("aria-controls", "synopsis-21");
  await user.click(button);
  expect(
    screen.getByRole("button", { name: "Collapse synopsis" }),
  ).toHaveAttribute("aria-expanded", "true");
  expect(document.getElementById("synopsis-21")?.textContent).toBe(text);
  await user.click(button);
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(button).toHaveFocus();
});
it("shows short and absent synopses without an unnecessary expander", () => {
  const { rerender } = render(<Synopsis id={1} text="Short story." />);
  expect(screen.getByText("Short story.")).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  rerender(<Synopsis id={2} text="" />);
  expect(
    screen.getByText("No synopsis is available for this title."),
  ).toBeInTheDocument();
});
