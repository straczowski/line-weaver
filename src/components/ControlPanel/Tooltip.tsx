import { useState } from "react"
type TooltipProps = {
    text: string
  }
  
export const Tooltip = ({ text }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="ml-1.5 flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-text-muted/20 text-[10px] font-medium text-text-muted transition-colors hover:bg-accent/30 hover:text-accent">
        ?
      </span>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-md bg-background px-3 py-2 text-xs text-text shadow-lg ring-1 ring-text-muted/20">
          {text}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-background" />
        </div>
      )}
    </div>
  )
}