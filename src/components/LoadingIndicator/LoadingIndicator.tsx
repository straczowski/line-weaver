import clsx from "clsx"

type LoadingIndicatorProps = {
  message: string
  size?: "sm" | "md"
  direction?: "row" | "column"
  className?: string
}

export const LoadingIndicator = ({ message, size = "md", direction = "row", className }: LoadingIndicatorProps) => {
  return (
    <div
      className={clsx("flex items-center gap-3", direction === "column" && "flex-col", className)}
    >
      <div
        className={clsx(
          "animate-spin rounded-full border-2 border-accent border-t-transparent",
          size === "sm" && "h-5 w-5",
          size === "md" && "h-8 w-8"
        )}
      />
      <p className="font-mono text-sm text-text-muted">{message}</p>
    </div>
  )
}

