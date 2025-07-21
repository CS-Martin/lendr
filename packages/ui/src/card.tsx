import { type JSX } from "react";

/**
 * Renders a styled card component as a link with a title and content, appending UTM parameters to the URL.
 *
 * The card displays the provided title and children, and opens the link in a new browser tab with tracking parameters.
 *
 * @param title - The heading text displayed on the card
 * @param children - The content displayed within the card
 * @param href - The base URL for the card link; UTM parameters are appended automatically
 * @param className - Optional CSS class for custom styling
 * @returns The rendered card as a clickable anchor element
 */
export function Card({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}): JSX.Element {
  return (
    <a
      className={className}
      href={`${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo"`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2>
        {title} <span>-&gt;</span>
      </h2>
      <p>{children}</p>
    </a>
  );
}
