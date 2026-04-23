'use client';

import { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronRight, MessageSquare, BookOpen, HelpCircle } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { q: 'How do I access my courses?', a: 'Navigate to the Library tab. All courses available under your plan will be accessible. Locked courses require a plan upgrade.' },
      { q: 'How does the plan system work?', a: 'We offer plan-based subscriptions (Starter, Pro, Elite). Each plan gives access to specific courses. Upgrade your plan to unlock more content.' },
      { q: 'Can I download course materials?', a: 'Each lesson has an attachments section with PDFs, tools, and reference documents that you can download.' },
    ],
  },
  {
    title: 'Trading Concepts',
    icon: GraduationCap,
    items: [
      { q: 'What is Orderflow trading?', a: 'Orderflow trading analyzes the actual buy and sell orders flowing through the market to identify supply/demand imbalances before they show on price charts.' },
      { q: 'How are Time Cycles used?', a: 'Time Cycles identify recurring patterns in market timing. They help predict when major turns are likely to occur based on mathematical relationships.' },
      { q: 'What indicators do you recommend?', a: 'Check the Indicators tab for our curated set of premium indicators. Each comes with a detailed strategy explanation.' },
    ],
  },
  {
    title: 'Account & Billing',
    icon: HelpCircle,
    items: [
      { q: 'How do I upgrade my plan?', a: 'Contact support through Discord or email to upgrade your subscription plan.' },
      { q: 'How do I join the Discord community?', a: 'After purchasing a plan, you will receive a secure one-time invite link to our private Discord server with role-based access.' },
      { q: 'What is the refund policy?', a: 'Please refer to our policy page for detailed refund information.' },
    ],
  },
];

export default function StudentTutorPage() {
  const [expandedSection, setExpandedSection] = useState<number>(0);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  function toggleItem(key: string): void {
    setExpandedItem(expandedItem === key ? null : key);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Tutor</h1>
        <p className="mt-1 text-sm text-white/40">Guidance, FAQ, and learning resources</p>
      </div>

      {/* AI Tutor Coming Soon */}
      <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent p-8 text-center">
        <MessageSquare size={40} className="mx-auto text-white/15" />
        <h2 className="mt-4 text-lg font-semibold text-white">AI Tutor</h2>
        <p className="mt-2 text-sm text-white/30">
          An AI-powered trading tutor trained on our strategies is coming soon.
          Ask questions about setups, market structure, and more.
        </p>
        <div className="mt-4 inline-flex rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-white/30">
          Coming Soon
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        {FAQ_SECTIONS.map((section, si) => {
          const Icon = section.icon;
          const isOpen = expandedSection === si;

          return (
            <div key={si} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => setExpandedSection(isOpen ? -1 : si)}
                className="flex w-full items-center justify-between p-5 text-left transition hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-white/30" />
                  <span className="text-sm font-semibold text-white">{section.title}</span>
                  <span className="text-xs text-white/20">{section.items.length} questions</span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-white/30" /> : <ChevronRight size={16} className="text-white/30" />}
              </button>

              {isOpen && (
                <div className="border-t border-white/5 px-5 pb-5">
                  {section.items.map((item, ii) => {
                    const key = `${si}-${ii}`;
                    const isItemOpen = expandedItem === key;

                    return (
                      <div key={ii} className="border-b border-white/[0.03] last:border-0">
                        <button
                          onClick={() => toggleItem(key)}
                          className="flex w-full items-center justify-between py-4 text-left"
                        >
                          <span className="text-sm text-white/60">{item.q}</span>
                          {isItemOpen ? <ChevronDown size={14} className="text-white/20 shrink-0" /> : <ChevronRight size={14} className="text-white/20 shrink-0" />}
                        </button>
                        {isItemOpen && (
                          <p className="pb-4 text-sm leading-relaxed text-white/35">{item.a}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
