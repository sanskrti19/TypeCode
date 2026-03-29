export default function ResultModal({ stats, text, input, onRestart }) {

  let correct = 0
  for (let i = 0; i < input.length; i++) {
    if (input[i] === text[i]) correct++
  }

  const wrong = input.length - correct

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

      <div className="bg-zinc-900 p-8 rounded-xl w-[600px] text-white">

        <h2 className="text-xl mb-6 text-center">Your Result</h2>

        <div className="flex justify-between mb-6">

          <div>
            <div className="text-3xl">{stats.wpm}</div>
            <div className="text-sm text-zinc-400">WPM</div>
          </div>

          <div>
            <div className="text-3xl">{stats.accuracy}%</div>
            <div className="text-sm text-zinc-400">Accuracy</div>
          </div>

          <div>
            <div className="text-3xl">{stats.time}s</div>
            <div className="text-sm text-zinc-400">Time</div>
          </div>

        </div>

        <div className="flex justify-between mb-6 text-sm text-zinc-400">
          <div>Correct: {correct}</div>
          <div>Wrong: {wrong}</div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-2 bg-zinc-800 rounded"
        >
          Restart
        </button>

      </div>
    </div>
  )
}