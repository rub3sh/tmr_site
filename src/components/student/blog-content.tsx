'use client';

import ReactMarkdown from 'react-markdown';

export function BlogContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="mt-10 mb-4 text-2xl font-bold text-white">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-8 mb-3 text-xl font-bold text-white">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-6 mb-2 text-lg font-semibold text-white">{children}</h3>
        ),
        p: ({ node, children }) => {
          const hasImage = node?.children?.some(
            (child) => child.type === 'element' && child.tagName === 'img'
          );
          if (hasImage) {
            return <div className="mb-4">{children}</div>;
          }
          return <p className="mb-4 text-sm leading-relaxed text-white/60">{children}</p>;
        },
        img: ({ src, alt }) => (
          <figure className="my-6">
            <img
              src={src ?? ''}
              alt={alt ?? ''}
              className="w-full rounded-xl border border-white/5 object-cover"
            />
            {alt && (
              <figcaption className="mt-2 text-center text-xs text-white/25">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline underline-offset-2 transition hover:text-white"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-white/60">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-4 list-decimal space-y-1 text-sm text-white/60">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-2 border-white/10 pl-4 text-sm italic text-white/40">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-white/70">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="my-4 overflow-x-auto rounded-lg border border-white/5 bg-white/[0.02] p-4 text-xs text-white/60">
            {children}
          </pre>
        ),
        hr: () => <hr className="my-8 border-white/5" />,
        strong: ({ children }) => (
          <strong className="font-semibold text-white/80">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-white/50">{children}</em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
