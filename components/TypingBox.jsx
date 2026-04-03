"use client"

import { useEffect, useState } from "react"
import { saveScore } from "@/lib/leaderboard"
import ResultModal from "./ResultModal"

export default function TypingBox({ roomId }) {

  const [language, setLanguage] = useState("javascript")
  const [difficulty, setDifficulty] = useState("easy")
  const [wpmHistory, setWpmHistory] = useState([])

  const [text, setText] = useState("")
  const [input, setInput] = useState("")
  const [showResult, setShowResult] = useState(false)

  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 0
  })

  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startTime, setStartTime] = useState(null)

  const snippets = [
    "function binarySearch(arr,target){ return arr.indexOf(target) }",
    "def binary_search(arr,target): return arr.index(target)",
    "for(let i=0;i<arr.length;i++){ console.log(arr[i]) }"
  ]

  const getSnippet = () => {
    return snippets[Math.floor(Math.random() * snippets.length)]
  }

  const finishTest = () => {
    if (finished) return

    console.log("FINISHED TRIGGERED")  

    setFinished(true)
    setIsRunning(false)
    setShowResult(true)

    saveScore({
      wpm: stats.wpm,
      accuracy: stats.accuracy
      
    })
    console.log("CALLING updateStreak")
    console.log("FINISH TEST CALLED")
  }

  const createRoom = async () => {
  const res = await fetch("/api/rooms", {
    method: "POST"
  });

  const data = await res.json();

  if (data.roomId) {
    window.location.href = `/room/${data.roomId}`;
  }
};

  const resetTest = () => {
    const snippet = getSnippet()

    setText(snippet)
    setInput("")
    setStats({ wpm: 0, accuracy: 100, time: 0 })

    setTimeLeft(30)
    setIsRunning(false)
    setFinished(false)
    setStartTime(null)
    setShowResult(false)
    setWpmHistory([])
  }

  useEffect(() => {
    resetTest()
  }, [language, difficulty])
 
  useEffect(() => {
    if (!isRunning || finished) return

    if (timeLeft === 0) {
      finishTest()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isRunning, timeLeft, finished])

  // KEY INPUT
  useEffect(() => {
    const handleKey = (e) => {

      if (finished) return

      if (e.key === "Escape") {
        resetTest()
        return
      }

      if (e.key === "Backspace") {
        setInput((prev) => prev.slice(0, -1))
        return
      }

      if (e.key.length === 1) {

        if (input.length >= text.length) return

        if (!isRunning) {
          setIsRunning(true)
          setStartTime(Date.now())
        }

        setInput((prev) => prev + e.key)
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)

  }, [finished, isRunning, input, text])

   
  useEffect(() => {

    if (!startTime) return

    let correct = 0

    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) correct++
    }

    const accuracy =
      input.length === 0
        ? 100
        : Math.round((correct / input.length) * 100)

    const time = (Date.now() - startTime) / 1000
    const wpm = Math.round((correct / 5) / (time / 60))

    setStats({
      wpm: isFinite(wpm) ? wpm : 0,
      accuracy,
      time: Math.floor(time)
    })

    setWpmHistory(prev => [...prev, wpm])

 
    if (input.length >= text.length) {
      finishTest()
    }

  }, [input])

  return (
    <>
      <main className="min-h-screen w-full bg-black text-white font-mono flex flex-col">

        <div className="w-full flex justify-between items-center px-12 py-6 border-b border-zinc-800">
          <h1 className="text-2xl text-zinc-200">TypeCode</h1>

           <div className="flex items-center gap-4">

  <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="bg-zinc-800 px-4 py-2 rounded">
    <option value="javascript">JavaScript</option>
    <option value="python">Python</option>
    <option value="cpp">C++</option>
    <option value="java">Java</option>
  </select>

  <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} className="bg-zinc-800 px-4 py-2 rounded">
    <option value="easy">Easy</option>
    <option value="hard">Hard</option>
  </select>

  <button
    onClick={resetTest}
    className="px-4 py-2 bg-zinc-900 rounded"
  >
    Restart
  </button>

  <button
    onClick={createRoom}
    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
  >
    Create Room
  </button>

</div>



        </div>

        <div className="flex justify-center mt-10 text-xl text-zinc-500">
          {timeLeft}
        </div>

        <div className="text-2xl leading-relaxed max-w-5xl mx-auto mt-10 text-center">

          {text.split("").map((char,i)=>{

            let className="text-zinc-600"

            if(i<input.length){
              className=input[i]===char ? "text-green-400":"text-red-500"
            }

            return <span key={i} className={className}>{char}</span>

          })}

        </div>

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

      </main>

 
      {showResult && (
        <ResultModal
          stats={stats}
          text={text}
          input={input}
          onRestart={resetTest}
        />
      )}
    </>
  )
}