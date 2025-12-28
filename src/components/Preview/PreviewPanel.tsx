type PreviewPanelProps = {
  title: string
  children: React.ReactNode
}

export const PreviewPanel = ({ title, children }: PreviewPanelProps) => {
  return (
    <div className="flex h-80 flex-col rounded-lg bg-surface">
      <h2 className="border-b border-text-muted/20 px-4 py-2 font-mono text-sm uppercase text-text-muted">
        {title}
      </h2>
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        {children}
      </div>
    </div>
  )
}

