import re

with open("mellows-hive/src/components/layout/navbar.tsx", "r") as f:
    s = f.read()

# Using regex to match spaces/newlines flexibly
s = re.sub(
    r'className=\{\`fixed left-1/2 top-4 z-50[^`]+`',
    r'className={`fixed left-1/2 top-4 z-50 w-max -translate-x-1/2 rounded-xl border border-[var(--gold-primary,rgba(212,175,55,1))] transition-all duration-300 ${scrolled ? \'bg-[rgba(18,18,18,0.7)] shadow-[0_4px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(212,175,55,0.25)] backdrop-blur-2xl\' : \'bg-[rgba(18,18,18,0.5)] shadow-[0_0_0_1px_rgba(212,175,55,0.15)] backdrop-blur-xl\'}`',
    s
)

# Flex containers and gaps
s = re.sub(
    r'className="flex min-h-11 items-center justify-between[^"]+"',
    r'className="flex min-h-11 items-center justify-between gap-0 px-2 py-1 lg:justify-center lg:px-2 md:min-h-12 md:px-2"',
    s
)

s = re.sub(
    r'className="hidden items-center gap-\d+ lg:flex"',
    r'className="hidden items-center gap-0 lg:flex"',
    s
)

s = re.sub(
    r'className="flex items-center gap-\d+"',
    r'className="flex items-center gap-0"',
    s
)

s = re.sub(
    r'className="group relative flex items-center gap-\d+\s+',
    r'className="group relative flex items-center gap-0 ',
    s
)

s = re.sub(
    r'className="select-none px-\S+ text-white/35">\|</span>',
    r'className="select-none px-[3px] text-[var(--gold-primary,rgba(212,175,55,0.8))]/50">|</span>',
    s
)

with open("mellows-hive/src/components/layout/navbar.tsx", "w") as f:
    f.write(s)
