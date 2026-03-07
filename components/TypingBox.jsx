"use client"

import { useEffect, useRef, useState } from "react"
import { createTypingEngine } from "@/lib/typingEngine"
// import { getRandomSnippet } from "@/lib/getSnippet"
import { saveScore, getScores } from "@/lib/leaderboard"
import snippets from "@/data/snippets.json"

export default function TypingBox() {
  const [language, setLanguage] = useState("javascript")
  const [difficulty, setDifficulty] = useState("easy")
  const [topic, setTopic] = useState("binary-search")
  const [pattern, setPattern] = useState("divide-and-conquer")
  const [mode, setMode] = useState("practice")

  const [text, setText] = useState(null)
  const engineRef = useRef(null)
  const [state, setState] = useState(null)

  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, time: 0 })
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const [scores, setScores] = useState([])

  const best = scores.length
    ? Math.max(...scores.map((s) => s.wpm))
    : 0

  const availablePatterns = [
    ...new Set(
      snippets
        .filter((s) => s.topic === topic)
        .map((s) => s.pattern)
    )
  ]

  const backgroundClass =
    mode === "competitive"
      ? "from-zinc-950 via-zinc-900 to-red-950"
      : "from-black via-zinc-900 to-black"

 
  const resetTest = () => {
    let snippet = getRandomSnippet({
      language,
      difficulty,
      topic,
      pattern
    })

  
    if (!snippet) {
      snippet = snippets[Math.floor(Math.random() * snippets.length)].code
    }

    const engine = createTypingEngine(snippet)
    engineRef.current = engine

    setText(snippet)
    setState(engine.getState())
    setStats({ wpm: 0, accuracy: 100, time: 0 })
    setTimeLeft(30)
    setIsRunning(false)
    setFinished(false)
  }

  // Load new snippet when filters change
  useEffect(() => {
    resetTest()
  }, [language, difficulty, topic, pattern])

  // Load leaderboard
  useEffect(() => {
    async function load() {
      const data = await getScores()
      setScores(data)
    }
    load()
  }, [finished])

  // Competitive timer effect
  useEffect(() => {
    if (mode !== "competitive") return
    if (!isRunning) return
    if (finished) return

    if (timeLeft <= 0) {
      setFinished(true)

      saveScore({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        date: new Date().toLocaleString()
      })

      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isRunning, timeLeft, mode, finished, stats])

  // Reset timer if switching to practice mode
  useEffect(() => {
    if (mode === "practice") {
      setTimeLeft(30)
      setIsRunning(false)
      setFinished(false)
    }
  }, [mode])

  // Keyboard handler
  useEffect(() => {
    if (!engineRef.current) return

    const handleKey = (e) => {
      if (finished) return

      if (e.key === "Escape") {
        resetTest()
        return
      }

      if (e.key === "Backspace") {
        const newState = engineRef.current.backspace()
        setState(newState)
        setStats(engineRef.current.getStats())
        return
      }

      if (e.key.length === 1) {
        if (!isRunning) setIsRunning(true)

        const newState = engineRef.current.type(e.key)
        setState(newState)
        setStats(engineRef.current.getStats())
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [finished, isRunning])

  if (!state) return null

  const progress =
    state.text.length > 0
      ? Math.min(
          (state.input.length / state.text.length) * 100,
          100
        )
      : 0


 return (
  <main
    className={`min-h-screen w-full bg-gradient-to-br ${
      mode === "competitive"
        ? "from-zinc-950 via-zinc-900 to-red-950"
        : backgroundClass
    } text-white font-mono flex flex-col transition-all duration-500`}
  >
    {/* HEADER */}
    <div className="w-full flex justify-between items-center px-12 py-6 border-b border-zinc-800">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-wide text-zinc-200">
          TypeCode
        </h1>

        {mode === "competitive" && (
          <span className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/40 rounded-full animate-pulse">
            COMPETITIVE
          </span>
        )}
      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-4">

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        >
          <option value="practice">Practice</option>
          <option value="competitive">Competitive</option>
        </select>

        <select
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        >
          {availablePatterns.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        >
          <option value="binary-search">Binary Search</option>
          <option value="recursion">Recursion</option>
          <option value="two-pointers">Two Pointers</option>
        </select>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="sql">SQL</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          onClick={resetTest}
          className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-all active:scale-95"
        >
          Restart
        </button>
      </div>
    </div>

    {/* CONTENT */}
    <div className="flex-1 flex flex-col justify-center px-20">

      {/* CENTER TIMER */}
      <div className="flex justify-center mb-6">
        <div
          className={`text-xl tracking-widest transition-all duration-300 ${
            mode === "competitive"
              ? timeLeft <= 10
                ? "text-red-400 animate-pulse"
                : "text-red-500"
              : "text-zinc-500"
          }`}
        >
          {timeLeft}
        </div>
      </div>

      
     {/* PROGRESS BAR */}
<div className="w-full h-2 bg-zinc-800 rounded-full mb-12 overflow-hidden">
  <div
    className={`h-full transition-all duration-500 ease-out ${
      mode === "competitive"
        ? "bg-gradient-to-r from-red-500 to-orange-500"
        : "bg-gradient-to-r from-green-400 to-emerald-500"
    }`}
    style={{ width: `${progress}%` }}
  />
</div>

      {/* TEXT DISPLAY */}
      <div className="text-2xl md:text-3xl leading-relaxed tracking-wide max-w-6xl mx-auto text-center">
        {state.text.split("").map((char, i) => {
          let className = "text-zinc-600";

          if (i < state.input.length) {
            if (state.input[i] !== char) {
              className = "text-red-500";
            } else {
              className = "text-green-400"; // all correct chars green (spaces included)
            }
          }

          if (i === state.index) {
            className += " border-l-2 border-yellow-400 animate-pulse";
          }

          return (
            <span key={i} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      {/* STATS */}
      <div className="flex justify-center gap-20 mt-16 text-zinc-400">
        <div className="text-center">
          <div className="text-3xl text-white">{stats.wpm}</div>
          <div className="text-sm">WPM</div>
        </div>
        <div className="text-center">
          <div className="text-3xl text-white">{stats.accuracy}%</div>
          <div className="text-sm">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-3xl text-white">{stats.time}s</div>
          <div className="text-sm">Time</div>
        </div>
      </div>
    </div>

    {/* FINISH MODAL */}
    {finished && (
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl p-8 text-center shadow-2xl">
          <h2 className="text-2xl mb-4">Test Complete</h2>

          <div className="space-y-2 text-zinc-300">
            <div>WPM: {stats.wpm}</div>
            <div>Accuracy: {stats.accuracy}%</div>
            <div>Chars: {state.input.length}</div>
          </div>

          <div className="mt-6 text-left">
            <h3 className="text-white mb-2">Top Scores</h3>
            {scores.map((s, i) => (
              <div
                key={i}
                className={`flex justify-between text-sm transition-all ${
                  s.wpm === best
                    ? "text-yellow-400 font-semibold"
                    : "text-zinc-400"
                }`}
              >
                <span>#{i + 1}</span>
                <span>{s.wpm}</span>
                <span>{s.accuracy}%</span>
              </div>
            ))}
          </div>

          <button
            onClick={resetTest}
            className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    )}
  </main>
);


}