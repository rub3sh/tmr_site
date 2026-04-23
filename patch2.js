const fs = require('fs');
let content = fs.readFileSync("src/components/layout/navbar.tsx", 'utf-8');

// Replace nav wrapper classes for perfect fit & golden border
content = content.replace(/className=\{`fixed left-1\/2 top-4 z-50 w-\[calc\(100%-1rem\)\] -translate-x-1\/2 rounded-2xl border lg:w-fit transition-all duration-300 \$\{/, 'className={`fixed left-1/2 top-4 z-50 w-fit -translate-x-1/2 rounded-2xl border border-[var(--gold-primary)] transition-all duration-300 ${');

// Replace flex container row spacing
content = content.replace('className="flex min-h-11 items-center justify-between gap-2 px-2.5 py-1 lg:justify-center lg:px-4 md:min-h-12 md:px-3"', 'className="flex min-h-11 items-center justify-between gap-0 px-2.5 py-1 lg:justify-center lg:px-2 md:min-h-12 md:px-2"');

// Replace desktop nav item gaps
content = content.replace('className="hidden items-center gap-1 lg:flex"', 'className="hidden items-center gap-0 lg:flex"');

content = content.replace(/className="flex items-center gap-1"/g, 'className="flex items-center gap-0"');

// Replace the separator padding
content = content.replace(/className="select-none px-1 text-white\/35">\|<\/span>/g, 'className="select-none px-1.5 text-[var(--gold-primary)]/50">|</span>');

fs.writeFileSync("src/components/layout/navbar.tsx", content);
