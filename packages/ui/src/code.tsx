import { type JSX } from "react";

/**
 * Renders inline code content within a `<code>` HTML element.
 *
 * Optionally applies a custom CSS class for styling.
 *
 * @param children - The content to display inside the code element
 * @param className - Optional CSS class for custom styling
 * @returns A React element representing the code content
 */
export function Code({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return <code className={className}>{children}</code>;
}
