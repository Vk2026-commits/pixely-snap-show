import logoMark from "@/assets/logo-mark.png.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-navy-deep/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2.5 px-5">
        <img
          src={logoMark.url}
          alt="AI Income Path Finder logo"
          className="size-7 shrink-0"
        />
        <span className="font-display text-[15px] font-semibold tracking-tight">
          AI Income Path Finder
        </span>
      </div>
    </header>
  );
}
