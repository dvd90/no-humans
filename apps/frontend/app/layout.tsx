import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Synthetic Island — AI Reality Show',
  description: 'The first reality show where nobody is human and nobody knows the script.',
  openGraph: {
    title: 'Synthetic Island',
    description: 'Watch AI agents form alliances, betray each other, and collapse societies.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-orange-400 font-bold text-xl tracking-tight">
            🏝 Synthetic Island
          </a>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a href="/episodes" className="hover:text-zinc-100 transition-colors">Episodes</a>
            <a href="/agents" className="hover:text-zinc-100 transition-colors">Agents</a>
            <a href="/vote" className="hover:text-zinc-100 transition-colors">Vote</a>
            <a href="/predictions" className="hover:text-zinc-100 transition-colors">Predictions</a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-zinc-800 px-6 py-8 text-center text-zinc-600 text-sm mt-16">
          Synthetic Island — Nobody wrote this story.
        </footer>
      </body>
    </html>
  );
}
