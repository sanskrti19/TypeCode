"use client"

import { useEffect, useState } from "react"
import { saveScore } from "@/lib/leaderboard"
import ResultModal from "./ResultModal"
 
 export default function TypingBox({ roomId , socket,  participants,
  leaderboard}) {
  
  

  const [language, setLanguage] = useState("javascript")
  const [difficulty, setDifficulty] = useState("easy")
  const [wpmHistory, setWpmHistory] = useState([])
  const [rooms, setRooms] = useState([]);

  const [showNameInput, setShowNameInput] = useState(true);
const [username, setUsername] = useState("");

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
const name = localStorage.getItem("username") || "Guest";

socket.emit("submit-score", {
  roomId,
  username: name,
  wpm: stats.wpm,
  accuracy: stats.accuracy
});
 

const finishTest = () => {
  if (finished) return;

  setFinished(true);
  setIsRunning(false);
  setShowResult(true);

  const name = localStorage.getItem("username") || "Guest";

  if (roomId && socket) {
    socket.emit("submit-score", {
      roomId,
      username: name,
      wpm: stats.wpm,
      accuracy: stats.accuracy
    });
  } else {
    saveScore({
      wpm: stats.wpm,
      accuracy: stats.accuracy
    });
  }
};

 


 
 
    saveScore({
      wpm: stats.wpm,
      accuracy: stats.accuracy
      
    })
    console.log("CALLING updateStreak")
    console.log("FINISH TEST CALLED")
  
const createRoom = async () => {

  const username = localStorage.getItem("username") || "Guest";

const newRoom = {
  id: roomId,
  name: `${username}'s Room`,
};
  const existingRoom = localStorage.getItem("roomId");

  if (existingRoom) {
    const confirmNew = confirm("You already have a room. Create a new one?");
    
    if (!confirmNew) {
      window.location.href = `/room/${existingRoom}`;
      return;
    }
  }

  const res = await fetch("/api/rooms", { method: "POST" });
  const data = await res.json();

   const saveRoom = (roomId) => {
  const rooms = JSON.parse(localStorage.getItem("rooms") || "[]");

  const exists = rooms.find(r => r.id === roomId);
  if (exists) return;


  const newRoom = {
    id: roomId,
     name: `${username}'s Room`,
  };
  localStorage.setItem("rooms", JSON.stringify([newRoom, ...rooms]));

  const updated = [newRoom, ...rooms];

  
};

  window.location.href = `/room/${data.roomId}`;
};

const [roomLink, setRoomLink] = useState("")


useEffect(() => {
  const storedRooms = JSON.parse(localStorage.getItem("rooms") || "[]");
  setRooms(storedRooms);
}, []);



useEffect(() => {
  if (roomId) {
    setRoomLink(`${window.location.origin}/room/${roomId}`)
  }
}, [roomId])

 const copyLink = () => {
  navigator.clipboard.writeText(roomLink);
  alert("Link copied!");
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
  }, [ language,  difficulty])
 
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
 
  useEffect(() => {
    const handleKey = (e) => {
  if (e.key === " ") {
    e.preventDefault();  
  }
  if (document.activeElement.tagName === "INPUT") return;

  if (finished) return;

  if (e.key === "Backspace") {
    setInput((prev) => prev.slice(0, -1));
    return;
  }

  if (e.key.length === 1) {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now());
    }
    setInput((prev) => prev + e.key);
  }
};


    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)

  }, [finished, isRunning, input, text])


  useEffect(() => {
  const name = localStorage.getItem("username");

  if (name) {
    setUsername(name);
    setShowNameInput(false);
  } else if (roomId) {
    
    setShowNameInput(true);
  }
}, [roomId]);


   
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
     
    {showNameInput && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-xl">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="px-3 py-2 bg-zinc-800 rounded w-full mb-3"
          />
         <button
  className="w-full bg-green-600 py-2 rounded"
  onClick={() => {
    const finalName = username || "Guest";

    localStorage.setItem("username", finalName);
    setShowNameInput(false);

    if (socket && roomId) {
  const name = localStorage.getItem("username") || "Guest";

  socket.emit("submit-score", {
    roomId,
    username: name,
    wpm: stats.wpm,
    accuracy: stats.accuracy
  });
}
  }}
>
  Join Room
</button>
          
        </div>
      </div>
    )}

    <main className="min-h-screen bg-black text-white p-6 flex flex-col gap-8">

   
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">TypeCode</h1>

        <div className="flex gap-3">
          <button onClick={resetTest} className="bg-zinc-800 px-4 py-2 rounded">
            Restart
          </button>

          <button onClick={createRoom} className="bg-green-600 px-4 py-2 rounded">
            Create Room
          </button>

          {roomId && (
            <button onClick={copyLink} className="bg-zinc-800 px-4 py-2 rounded">
              🔗 Copy Link
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 max-w-7xl mx-auto">

        
        <div className="flex-1 flex flex-col items-center">

          <div className="text-xl text-zinc-500 mb-4">
            {timeLeft}s
          </div>

          <div className="text-2xl leading-relaxed text-center max-w-4xl">
            {text.split("").map((char, i) => {
              let style = "text-zinc-600";

              if (i < input.length) {
                style =
                  input[i] === char
                    ? "text-green-400"
                    : "text-red-500";
              }

              return (
                <span key={i} className={style}>
                  {char}
                </span>
              );
            })}
          </div>

          {/* STATS */}
          <div className="flex gap-16 mt-10 text-center">
            <div>
              <div className="text-2xl">{stats.wpm}</div>
              <div className="text-sm text-zinc-400">WPM</div>
            </div>

            <div>
              <div className="text-2xl">{stats.accuracy}%</div>
              <div className="text-sm text-zinc-400">Accuracy</div>
            </div>

            <div>
              <div className="text-2xl">{stats.time}s</div>
              <div className="text-sm text-zinc-400">Time</div>
            </div>
          </div>

        </div>

        
        <div className="w-[300px] space-y-4">

           
          <div className="bg-zinc-900 p-4 rounded-xl">
            <h3 className="mb-2 text-zinc-300">Participants</h3>
            {participants?.map((p, i) => (
              <p key={i} className="text-sm text-zinc-400">
                {p.username}
              </p>
            ))}
          </div>

         
          <div className="bg-zinc-900 p-4 rounded-xl">
            <h3 className="mb-2 text-zinc-300">Leaderboard</h3>
            {leaderboard?.map((l, i) => (
              <p key={i} className="text-sm text-zinc-400">
                {i + 1}. {l.username} ({l.accuracy}%)
              </p>
            ))}
          </div>

         
          <div className="bg-zinc-900 p-4 rounded-xl">
            <h3 className="mb-2 text-zinc-300">Your Rooms</h3>
            {rooms.map((r) => (
              <div key={r.id} className="flex justify-between text-sm mb-1">
                <span>{r.name}</span>
                <button
                  className="text-green-400"
                  onClick={() =>
                    (window.location.href = `/room/${r.id}`)
                  }
                >
                  Join
                </button>
                <button
                 onClick={() => (window.location.href = "/")}
                className="bg-zinc-800 px-4 py-2 rounded"
                >
                 Home
                </button>


              </div>
            ))}
          </div>

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
); 
}