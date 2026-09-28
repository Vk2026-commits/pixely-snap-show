export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-navy-deep/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2.5 px-5">
        <span
          className="flex size-7 items-center justify-center rounded-md bg-primary font-display text-[13px] font-bold text-primary-foreground"
          aria-hidden
        >
          A
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight">
          AI Income Path Finder
        </span>
      </div>
    </header>
  );
}
