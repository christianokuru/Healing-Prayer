import { render, screen } from "@testing-library/react";
import { Field } from "./Field";
import { Input } from "./Input";

describe("Field", () => {
  it("labels the control", () => {
    render(
      <Field id="email" label="Email">
        {(control) => <Input {...control} />}
      </Field>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("links the hint so screen readers read it", () => {
    render(
      <Field id="phone" label="Phone" hint="Include the country code.">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const input = screen.getByLabelText("Phone");
    expect(input).toHaveAccessibleDescription("Include the country code.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("marks the control invalid and reads the error before the hint", () => {
    render(
      <Field id="phone" label="Phone" hint="Include the country code." error="Use digits only.">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const input = screen.getByLabelText("Phone");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Use digits only. Include the country code.");
  });

  it("shows a counter", () => {
    render(
      <Field id="prayer" label="Prayer point" count="12 / 10,000">
        {(control) => <Input {...control} />}
      </Field>,
    );
    expect(screen.getByText("12 / 10,000")).toBeInTheDocument();
  });
});
