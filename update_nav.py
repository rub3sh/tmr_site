import re
with open("mellows-hive/src/components/layout/navbar.tsx", "r") as f:
    s = f.read()

# Make perfect fit and golden border
s = re.sub(
    r"w-\[calc\(100%-1rem\)\] -translate-x-1/2 rounded-2xl border lg:w-fit ",
    r"w-max -translate-x-1/2 rounded-xl border border-[var(--gold-primary,rgba(212,175,55,1))] ",
    s
)

# Remove gap-2 and reduce padding
s = s.replace(
    'className="flex min-h-11 items-center justify-between gap-2 px-2.5 py-1 lg:justify-center lg:px-4 md:min-h-12 md:px-3"',
    'className="flex min-h-11 items-center justify-between gap-0 px-2 py-1 lg:justify-center lg:px-2 md:min-h-12 md:px-2"'
)

# Remove gap from desktop nav
s = s.replace(
    'className="hidden items-center gap-1 lg:flex"',
    'className="hidden items-center lg:flex"'
)
s = s.replace(
    'className="flex items-center gap-1"',
    'className="flex items-center gap-0"'
)
s = s.replace(
    'className="group relative flex items-center gap-1 ',
    'className="group relative flex items-center gap-0 '
)

# Change separators
s = s.replace(
    'className="select-none px-1 text-white/35">|</span>',
    'className="select-none px-[3px] text-[var(--gold-primary,rgba(212,175,55,0.8))]/50">|</span>'
)

with open("mellows-hive/src/components/layout/navbar.tsx", "w") as f:
    f.write(s)
