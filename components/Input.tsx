import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;

  error?: string;

  hint?: string;
};

export default function Input({
  id,
  label,
  error,
  hint,
  className = "",
  ...rest
}: Props) {
  const pesanId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-meta font-medium text-text">
        {label}
      </label>
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={pesanId}
        className={
          "h-10 w-full rounded-button border bg-surface px-3 text-sm text-text " +
          "transition-colors duration-120 ease-signal " +
          "placeholder:text-text-muted hover:border-text-muted focus:border-accent " +
          "disabled:border-border disabled:bg-bg disabled:text-text-muted " +
          (error ? "border-danger " : "border-border-strong ") +
          className
        }
      />
      {error ? (
        <p id={pesanId} className="text-meta text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={pesanId} className="text-meta text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
