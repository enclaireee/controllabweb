import type { TextareaHTMLAttributes } from "react";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export default function Textarea({
  id,
  label,
  error,
  hint,
  className = "",
  rows = 5,
  ...rest
}: Props) {
  const pesanId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-meta font-medium text-text">
        {label}
      </label>
      <textarea
        {...rest}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={pesanId}
        className={
          "w-full rounded-button border bg-surface px-3 py-2 text-sm text-text " +
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
