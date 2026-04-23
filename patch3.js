const fs = require('fs');
let content = fs.readFileSync("src/components/layout/navbar.tsx", 'utf-8');

// 1. the flex container gap and padding
content = content.replace(
  /className="flex min-h-11 items-center justify-between gap-[^"]+"/g,
  'className="flex min-h-11 items-center justify-between gap-0 px-2 py-1 lg:justify-center lg:px-2 md:min-h-12 md:px-2"'
);

// 2. desktop nav wrapper gap
content = content.replace(
  /className="hidden items-center gap-[^"]+"/,
  'className="hidden items-center gap-0 lg:flex"'
);

// 3. NAV_ITEMS mapping gap
content = content.replace(
  /className="flex items-center gap-1"/g,
  'className="flex items-center gap-0"'
);

// \4. Separators
content = content.replace(
  /className="select-none px-[^"]+"/g,
  'className="select-none px-1.5 text-[var(--gold-primary)]/50"'
);

// 5. nav wrapper fixed left-1/2
content = content.replace(
  /className=\{\`fixed left-1\/2 top-4 z-50[^`]+\`/g,
  function(match) {
    return 'className={`fixed left-1/2 top-4 z-50 w-fit -translate-x-1/2 rounded-full border border-[var(--gold-primary)] transition-all duration-300 ${'
  }
);

content = content.replace(
  /border-\[color:rgba\(212,175,55,0\.62\)\]/g,
  'border-[var(--gold-primary)]'
);
content = content.replace(
  /border-\[color:rgba\(212,175,55,0\.42\)\]/g,
  'border-[var(--gold-primary,rgba(212,175,55,0.5))]'
);

fs.writeFileSync("src/components/layout/navbar.tsx", content);
console.log("Replaced!");
