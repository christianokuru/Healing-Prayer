import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("is a non-submitting button by default", () => {
    render(<Button>Continue</Button>);
    expect(screen.getByRole("button", { name: "Continue" })).toHaveAttribute("type", "button");
  });

  it("shows the loading text, is busy and cannot be clicked while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingText="Booking…" onClick={onClick}>
        Confirm booking
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Booking…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps its label while loading when no loading text is given", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
