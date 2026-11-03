import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RemoteNavigation } from "./RemoteNavigation";

function position(
  name: string,
  x: number,
  y: number,
  width = 100,
  height = 80,
) {
  const element = screen.getByRole("button", { name });
  jest.spyOn(element, "getBoundingClientRect").mockReturnValue({
    x,
    y,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
    toJSON: () => ({}),
  });
  return element;
}
beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn();
});
afterEach(() => jest.restoreAllMocks());

it("starts on the first main control only after an arrow, and Enter activates it", async () => {
  const activate = jest.fn();
  render(
    <RemoteNavigation>
      <main>
        <button onClick={activate}>First</button>
      </main>
    </RemoteNavigation>,
  );
  const first = position("First", 0, 0);
  expect(document.body).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  expect(first).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(activate).toHaveBeenCalledTimes(1);
});

it("moves in four directions using the rendered rows and columns", () => {
  render(
    <RemoteNavigation>
      <main>
        {["A", "B", "C", "D"].map((name) => (
          <button key={name}>{name}</button>
        ))}
      </main>
    </RemoteNavigation>,
  );
  const a = position("A", 0, 0),
    b = position("B", 120, 0);
  const c = position("C", 0, 100),
    d = position("D", 120, 100);
  a.focus();
  fireEvent.keyDown(a, { key: "ArrowRight" });
  expect(b).toHaveFocus();
  fireEvent.keyDown(b, { key: "ArrowDown" });
  expect(d).toHaveFocus();
  fireEvent.keyDown(d, { key: "ArrowLeft" });
  expect(c).toHaveFocus();
  fireEvent.keyDown(c, { key: "ArrowUp" });
  expect(a).toHaveFocus();
  expect(a.scrollIntoView).toHaveBeenCalledWith({
    block: "nearest",
    inline: "nearest",
    behavior: "instant",
  });
  // The same DOM becomes a single column on a narrow screen.
  jest.mocked(b.getBoundingClientRect).mockReturnValue({
    ...b.getBoundingClientRect(),
    left: 0,
    right: 100,
    top: 100,
    bottom: 180,
    x: 0,
    y: 100,
  });
  fireEvent.keyDown(a, { key: "ArrowDown" });
  expect(b).toHaveFocus();
});

it("ignores disabled and hidden controls and retains focus at a boundary", () => {
  render(
    <RemoteNavigation>
      <main>
        <button>A</button>
        <button disabled>Disabled</button>
        <button hidden>Hidden</button>
        <button>B</button>
      </main>
    </RemoteNavigation>,
  );
  const a = position("A", 0, 0),
    b = position("B", 360, 0);
  position("Disabled", 120, 0);
  a.focus();
  fireEvent.keyDown(a, { key: "ArrowRight" });
  expect(b).toHaveFocus();
  const event = new KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });
  b.dispatchEvent(event);
  expect(b).toHaveFocus();
  expect(event.defaultPrevented).toBe(true);
});

it("preserves text editing and shortcuts but permits vertical exit from search", () => {
  render(
    <RemoteNavigation>
      <main>
        <input aria-label="Search" />
        <button>Result</button>
      </main>
    </RemoteNavigation>,
  );
  const input = screen.getByRole("textbox");
  jest.spyOn(input, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 40,
    width: 100,
    height: 40,
    toJSON: () => ({}),
  });
  const result = position("Result", 0, 100);
  input.focus();
  const caret = new KeyboardEvent("keydown", {
    key: "ArrowRight",
    bubbles: true,
    cancelable: true,
  });
  input.dispatchEvent(caret);
  expect(caret.defaultPrevented).toBe(false);
  expect(input).toHaveFocus();
  fireEvent.keyDown(input, { key: "ArrowDown", altKey: true });
  expect(input).toHaveFocus();
  fireEvent.keyDown(input, { key: "ArrowDown", isComposing: true });
  expect(input).toHaveFocus();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(result).toHaveFocus();
});

it("does not intercept arrows in multiline editors or selects", () => {
  render(
    <RemoteNavigation>
      <textarea aria-label="Notes" />
      <select aria-label="Choice">
        <option>One</option>
      </select>
      <button>Other</button>
    </RemoteNavigation>,
  );
  position("Other", 0, 100);
  for (const field of [
    screen.getByRole("textbox"),
    screen.getByRole("combobox"),
  ]) {
    field.focus();
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    field.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(field).toHaveFocus();
  }
});

it("includes newly rendered controls and removes its listener on unmount", () => {
  const { rerender, unmount } = render(
    <RemoteNavigation>
      <button>A</button>
    </RemoteNavigation>,
  );
  const a = position("A", 0, 0);
  a.focus();
  rerender(
    <RemoteNavigation>
      <button>A</button>
      <button>B</button>
    </RemoteNavigation>,
  );
  const b = position("B", 0, 100);
  fireEvent.keyDown(a, { key: "ArrowDown" });
  expect(b).toHaveFocus();
  unmount();
  const event = new KeyboardEvent("keydown", {
    key: "ArrowDown",
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
});

it("enters a wide search control before a more distant card below a filter", () => {
  render(
    <RemoteNavigation>
      <main>
        <button>Filter</button>
        <button>Search field</button>
        <button>Card</button>
      </main>
    </RemoteNavigation>,
  );
  const filter = position("Filter", 100, 0, 80, 40);
  const search = position("Search field", 0, 70, 800, 40);
  position("Card", 100, 160, 100, 100);
  filter.focus();
  fireEvent.keyDown(filter, { key: "ArrowDown" });
  expect(search).toHaveFocus();
});
