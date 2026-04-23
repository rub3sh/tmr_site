const fs = require('fs');
const lines = fs.readFileSync("src/components/layout/navbar.tsx", 'utf-8').split('\n');

const newLines = `      <nav
        className={\`fixed left-1/2 top-4 z-50 w-max -translate-x-1/2 rounded-2xl border border-[var(--gold-primary,rgba(212,175,55,1))] transition-all duration-300 \${
          scrolled
            ? 'bg-[rgba(18,18,18,0.75)] shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(212,175,55,0.2)] backdrop-blur-2xl'
            : 'bg-[rgba(18,18,18,0.55)] shadow-[0_0_0_1px_rgba(212,175,55,0.15)] backdrop-blur-xl'
        }\`}
      >
        <div className="flex min-h-11 items-center justify-between gap-0 px-2 py-1 lg:justify-center lg:px-2 md:min-h-12 md:px-2">
          <Link href="/" className="flex items-center pr-1" onClick={() => setMobileOpen(false)}>
            <Image
              src="/logo/logo.png"
              alt="Logo"
              width={44}
              height={44}
              className="h-7 w-7 shrink-0 object-contain md:h-8 md:w-8"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center lg:flex gap-0">
            <span aria-hidden="true" className="select-none text-[var(--gold-primary)]/50">|</span>`.split('\n');

lines.splice(203, 23, ...newLines);
fs.writeFileSync("src/components/layout/navbar.tsx", lines.join('\n'));
