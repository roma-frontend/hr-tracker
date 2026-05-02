'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownMessage({ content, isUser }: MarkdownMessageProps) {
  return (
    <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Таблица
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-lg border border-[var(--border)]">
                <table className="w-full text-sm border-collapse">{children}</table>
              </div>
            );
          },
          // Заголовок таблицы
          thead({ children }) {
            return (
              <thead className="bg-[var(--primary)]/10 border-b border-[var(--border)]">
                {children}
              </thead>
            );
          },
          // Строка таблицы
          tr({ children }) {
            return (
              <tr className="border-b border-[var(--border)] last:border-b-0 even:bg-[var(--background-subtle)]/50 hover:bg-[var(--background-subtle)] transition-colors">
                {children}
              </tr>
            );
          },
          // Ячейка заголовка
          th({ children }) {
            return (
              <th className="px-3 py-2 text-left font-semibold text-[var(--text-primary)]">
                {children}
              </th>
            );
          },
          // Ячейка данных
          td({ children }) {
            return <td className="px-3 py-2 text-[var(--text-secondary)]">{children}</td>;
          },
          // Параграф
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },
          // Жирный текст
          strong({ children }) {
            return <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>;
          },
          // Списки
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-[var(--text-secondary)]">{children}</li>;
          },
          // Ссылки
          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                {children}
              </a>
            );
          },
          // Блок кода
          pre({ children }) {
            return (
              <pre className="bg-[var(--background-subtle)] border border-[var(--border)] rounded-lg p-3 my-2 overflow-x-auto text-xs">
                {children}
              </pre>
            );
          },
          // Inline код
          code({ children, className }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-[var(--background-subtle)] text-[var(--primary)] px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              );
            }
            return <code className="text-xs font-mono text-[var(--text-primary)]">{children}</code>;
          },
          // Заголовки
          h1({ children }) {
            return (
              <h1 className="text-lg font-bold mb-2 text-[var(--text-primary)]">{children}</h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-base font-bold mb-2 mt-3 text-[var(--text-primary)]">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-sm font-bold mb-1 mt-2 text-[var(--text-primary)]">{children}</h3>
            );
          },
          // Горизонтальная линия
          hr() {
            return <hr className="my-3 border-[var(--border)]" />;
          },
          // Цитата
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-[var(--primary)] pl-3 my-2 italic text-[var(--text-muted)]">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
