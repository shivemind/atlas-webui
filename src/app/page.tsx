import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <main className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Atlas<span className="text-cyan-400">Payments</span>
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Payments infrastructure with integrated EchoAtlas Observatory monitoring.
          View agent metrics, query analytics, and underground threat detection
          from a unified dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors"
          >
            Open Dashboard
          </Link>
          <a
            href="https://echo-atlas.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Visit EchoAtlas
          </a>
        </div>
      </main>
    </div>
  );
}
