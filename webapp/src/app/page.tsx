'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import type { NewsItem } from '@/lib/news';

type FetchState = 'idle' | 'loading' | 'error' | 'success';

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadNews = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/news', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('No se pudieron obtener las noticias.');
      }

      const data = await response.json();
      setNews(data.items ?? []);
      setUpdatedAt(new Date());
      setStatus('success');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadNews().catch(() => {
      // La función ya gestiona el estado de error.
    });
  }, [loadNews]);

  const formattedDate = useMemo(() => {
    if (!updatedAt) return '';
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(updatedAt);
  }, [updatedAt]);

  const downloadExcel = useCallback(() => {
    window.location.href = '/api/news/export';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-3">
          <span className="text-sm uppercase tracking-widest text-slate-400">
            Automatización informativa
          </span>
          <h1 className="text-4xl font-semibold text-white">
            Monitor de noticias sobre IA en el deporte
          </h1>
          <p className="max-w-2xl text-base text-slate-300">
            Consulta las últimas novedades sobre el impacto de la inteligencia
            artificial en el mundo deportivo y descarga un reporte en Excel con
            titulares y resúmenes listos para compartir.
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/40">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={loadNews}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-blue-500/60"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Actualizar noticias
            </button>
            <button
              onClick={downloadExcel}
              disabled={status === 'loading' || news.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:border-slate-700/60 disabled:text-slate-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Descargar Excel
            </button>
            {formattedDate ? (
              <span className="text-sm text-slate-400">
                Última actualización: {formattedDate}
              </span>
            ) : null}
          </div>

          {status === 'loading' ? (
            <div className="flex h-40 items-center justify-center">
              <span className="animate-pulse text-sm text-slate-400">
                Buscando historias relevantes…
              </span>
            </div>
          ) : null}

          {status === 'error' && errorMessage ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {status === 'success' && news.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
              No se encontraron noticias recientes. Intenta de nuevo más tarde.
            </div>
          ) : null}

          {news.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {news.map((item) => (
                <li
                  key={item.link || item.title}
                  className="flex h-full flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4"
                >
                  <div className="flex flex-col gap-2">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-white hover:text-blue-300"
                    >
                      {item.title}
                    </a>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {item.summary}
                    </p>
                  </div>
                  {item.publishedAt ? (
                    <span className="mt-4 text-xs uppercase tracking-widest text-slate-500">
                      {item.publishedAt}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}
