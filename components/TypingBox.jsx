"use client"

import { useEffect, useRef, useState } from "react"
import { createTypingEngine } from "@/lib/typingEngine"
import { getRandomSnippet } from "@/lib/getSnippet"

export default function TypingBox() {
  const [language, setLanguage] = useState("javascript")
  const [difficulty, setDifficulty] = useState("easy")
  const [text, setText] = useState(null)
  const engineRef = useRef(null)
  const [state, setState] = useState(null)
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, time: 0 })
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(false)

  const resetTest = () => {
  const snippet = getRandomSnippet({ language, difficulty })

  const engine = createTypingEngine(snippet)
  engineRef.current = engine

  setText(snippet)
  setState(engine.getState())
  setStats({ wpm: 0, accuracy: 100, time: 0 })
}

 
  useEffect(() => {
    const snippet = getRandomSnippet({ language, difficulty })
    setText(snippet)

    const engine = createTypingEngine(snippet)
    engineRef.current = engine
    setState(engine.getState())
  }, [language, difficulty])

   useEffect(() => {
  if (!isRunning) return
  if (timeLeft <= 0) return

  const timer = setTimeout(() => {
    setTimeLeft(30)
  }, 1000)

  return () => clearTimeout(timer)
}, [isRunning, timeLeft])


 useEffect(() => {
  if (timeLeft <= 0) return
  if (!isRunning) {
  setIsRunning(false)
}
  if (!engineRef.current) return

  const handleKey = (e) => {

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
      const newState = engineRef.current.type(e.key)
      setState(newState)
      setStats(engineRef.current.getStats())
    }
  }

  window.addEventListener("keydown", handleKey)
  return () => window.removeEventListener("keydown", handleKey)

}, [text])

  if (!state) return null

 return (
  <main className="h-screen flex flex-col items-center justify-center bg-black font-mono">
 
<div className="flex flex-col text-xs text-zinc-500">
  Language
  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
    className="appearance-none bg-zinc-900 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
  >
    <option value="javascript">JavaScript</option>
    <option value="python">Python</option>
    <option value="cpp">C++</option>
    <option value="sql">SQL</option>
  </select>
  </div>

  <select
    value={difficulty}
    onChange={(e) => setDifficulty(e.target.value)}
    className="appearance-none bg-zinc-900 text-white px-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
  >
    <option value="easy">Easy</option>
    <option value="medium">Medium</option>
    <option value="hard">Hard</option>
  </select>

 

     
    <div className="text-zinc-500 text-sm mb-2">
      Time Left: <span className="text-white">{timeLeft}s</span>
    </div>

    
    <div className="text-3xl md:text-4xl tracking-wide text-zinc-500 max-w-4xl text-center leading-relaxed mb-6">
      {state.text.split("").map((char, i) => {
        let className = "text-zinc-600"

        if (i < state.input.length) {
          className =
            state.input[i] === char
              ? "text-white"
              : "text-red-500"
        }

        if (i === state.index) {
          className += " border-l-2 border-yellow-400"
        }

        return (
          <span key={i} className={className}>
            {char}
          </span>
        )
      })}
    </div>

    {/* stats */}
    <div className="flex gap-6 text-sm text-zinc-400 mb-6">
      <div>WPM: <span className="text-white">{stats.wpm}</span></div>
      <div>Accuracy: <span className="text-white">{stats.accuracy}%</span></div>
      <div>Time: <span className="text-white">{stats.time}s</span></div>
    </div>

    {/* restart */}
    <button
      onClick={resetTest}
      className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition"
    >
      Restart Test
    </button>

  </main>
)
}