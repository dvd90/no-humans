export default function PredictionsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Predictions</h1>
      <p className="text-zinc-400 mb-10">
        Think you know what the agents will do? Prove it.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="text-sm text-orange-400 font-semibold mb-2 uppercase tracking-wide">
          No open predictions yet
        </div>
        <p className="text-zinc-400 text-sm">
          Predictions will open with the first published episode. Each episode generates 3
          questions about what agents will do next.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
          How predictions work
        </h2>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li className="flex gap-2">
            <span className="text-orange-400">→</span>
            Each episode ends with 3 prediction questions about upcoming agent behavior
          </li>
          <li className="flex gap-2">
            <span className="text-orange-400">→</span>
            Questions are objectively resolvable within 1–3 episodes
          </li>
          <li className="flex gap-2">
            <span className="text-orange-400">→</span>
            Correct predictions earn points — no money, no gambling
          </li>
        </ul>
      </div>
    </div>
  );
}
