export default function ResultModal({ stats, text, input, onRestart }) {
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === text[i]) correct++;
  }
  const wrong = input.length - correct;

  return (
    <div className="fixed inset-0 bg-bg/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-bg-sub border border-border rounded-xl w-full max-w-md p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-widest text-text-sub text-center mb-2">
          test complete
        </p>
        <h2 className="font-mono text-4xl text-text-main text-center mb-8 tabular-nums">
          {stats.wpm}{" "}
          <span className="text-lg text-text-sub">wpm</span>
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <p className="font-mono text-2xl text-text-main tabular-nums">
              {stats.accuracy}%
            </p>
            <p className="text-[10px] uppercase tracking-widest text-text-sub mt-1">
              accuracy
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-2xl text-success tabular-nums">
              {correct}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-text-sub mt-1">
              correct
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-2xl text-error tabular-nums">
              {wrong}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-text-sub mt-1">
              errors
            </p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-accent hover:bg-accent-dim text-white rounded-lg text-sm font-medium transition-colors"
        >
          try again
        </button>
        <p className="text-center text-xs text-text-dim mt-3">
          press <kbd className="font-mono text-text-sub">tab</kbd> +{" "}
          <kbd className="font-mono text-text-sub">enter</kbd> to restart
        </p>
      </div>
    </div>
  );
}
