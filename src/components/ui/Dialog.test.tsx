import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Dialog } from "./Dialog";

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Cancel this booking?"
      >
        <p>Thursday 12 November, 7:30 PM</p>
      </Dialog>
    </>
  );
}

const dialogEl = () => document.querySelector("dialog") as HTMLDialogElement;

describe("Dialog", () => {
  it("is closed until opened, then named by its title", () => {
    render(<Harness />);
    expect(dialogEl()).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Open"));
    expect(dialogEl()).toHaveAttribute("open");
    expect(screen.getByRole("dialog", { name: "Cancel this booking?" })).toBeInTheDocument();
  });

  it("closes on Escape (the native cancel event)", () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.click(screen.getByText("Open"));
    fireEvent(dialogEl(), new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(dialogEl()).not.toHaveAttribute("open");
  });

  it("closes from the close button", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Open"));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialogEl()).not.toHaveAttribute("open");
  });

  it("closes on a backdrop click but not on a click inside", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Open"));
    fireEvent.click(screen.getByText("Thursday 12 November, 7:30 PM"));
    expect(dialogEl()).toHaveAttribute("open");
    fireEvent.click(dialogEl());
    expect(dialogEl()).not.toHaveAttribute("open");
  });
});
