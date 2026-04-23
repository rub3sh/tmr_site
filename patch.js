const fs = require('fs');
let content = fs.readFileSync("src/components/layout/navbar.tsx", 'utf-8');

// 1. the flex container gap and padding
content = content.replace(
  '<div className="flex min-h-11 items-center justify-between gap-2 px-2.5 py-1 lg:justify-center lg:px-4 md:min-h-12 md:px-3">',
  '<div className="flex min-h-11 items-center justify-between gap-0 px-2.5 py-1 lg:justify-center lg:px-2 md:min-h-12 md:px-2">'
);

// 2. desktop nav wrapper gap
content = content.replace(
  '<div className="hidden items-center gap-1 lg:flex">',
  '<div className="hidden items-center gap-0 lg:flex">'
);

// 3. NAV_ITEMS mapping gap
content = content.replace(
  '<div key={item.label} className="flex items-center gap-1">',
  '<div key={item.label} className="flex items-center gap-0">'
);

// 4. remove px-1 from separators
content = content.replace(/className="select-none px-1 text-white\/35">\|<\/span>/g, 'className="select-none px-0.5 text-white/35">|</span>');

// 5. nav wrapper fixed left-1/2
content = content.replace(/className=\{`fixed left-1\/2 top-4 z-50 w-\[calc\(100%-1rem\)\] -translate-x-1\/2 rounded-2xl border lg:w-fit transition-all duration-300 \$\{/g, 'className={`fixed left-1/2 top-4 z-50 w-fit -translate-x-1/2 rounded-2xl border border-[var(--gold-primary)] transition-all duration-300 ${');

fs.writeFileSync("src/components/layout/navbar.tsx", content);
