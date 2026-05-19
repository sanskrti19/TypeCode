"use client"
import { useEffect, useState, useRef } from "react"
import { getRandomSnippet } from "@/lib/useSnippet";
import ResultModal from "./ResultModal"
import StreakCalendar from "./StreakCalendar" 
 export default function TypingBox({ roomId , socket,  participants}) {
  const hasSubmitted = useRef(false);
 
   const [rooms, setRooms] = useState([]);
 const [showNameInput, setShowNameInput] = useState(true);
  const [username, setUsername] = useState("");
  const [text, setText] = useState("")
  const [input, setInput] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [stats, setStats] = useState({wpm: 0,accuracy: 100,time: 0 })
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startTime, setStartTime] = useState(null)
 const [leaderboardData,setLeaderboard]=useState([]);
 const getSnippet = () => getRandomSnippet();
  
 const finishTest = async()=>{
if(hasSubmitted.current)
return;
hasSubmitted.current=true;
if(finished) return;
const name =localStorage.getItem("username");
try{await fetch("/api/score",{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({username:name,wpm:stats.wpm,accuracy:stats.accuracy})}
);
}catch(error){console.log(error);}
setFinished(true);
setIsRunning(false);
setShowResult(true);
if(roomId && socket){
socket.emit("submit-score",{roomId,username:name,wpm:stats.wpm,accuracy:stats.accuracy});
}}
 
 useEffect(()=>{const getLeaderboard=async()=>{const res=await fetch("/api/leaderboard");
const data=await res.json();
setLeaderboard(data);
};
getLeaderboard();
},[]);
const createRoom = async () => {
  if (!localStorage.getItem("username")) {
    setShowNameInput(true);
    return;
  }
  const username =localStorage.getItem("username");
  const existingRoom =localStorage.getItem("activeRoom");
  if (existingRoom) {
    const confirmNew = confirm(
      "You already have a room. Create a new one?"
    );
    if (!confirmNew) {
      window.location.href = `/room/${existingRoom}`;
      return;
    }
  }
  const res =await fetch("/api/rooms",{method:"POST"});
  const data =await res.json();
  const rooms =JSON.parse(localStorage.getItem("rooms")|| "[]");
  const newRoom = {
    id:data.roomId,name:`${username}'s Room`};
  const exists =rooms.find(r=>r.id===data.roomId);
    if(!exists){
    localStorage.setItem("rooms", JSON.stringify(
      [newRoom,...rooms]
      )
    );
  }
  localStorage.setItem(
    "activeRoom",
    data.roomId
  );
  window.location.href =`/room/${data.roomId}`;
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
    hasSubmitted.current=false;
    const snippet = getSnippet()
    setText(snippet)
    setInput("")
    setStats({ wpm: 0, accuracy: 100, time: 0 })
    setTimeLeft(30)
    setIsRunning(false)
    setFinished(false)
    setStartTime(null)
    setShowResult(false)
     
  }
  useEffect(() => {
    resetTest()
  }, [  ])
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
      input.length === 0 ? 100 : Math.round((correct / input.length) * 100)
    const time = (Date.now() - startTime) / 1000
    const wpm = Math.round((correct / 5) / (time / 60))
    setStats({
      wpm: isFinite(wpm) ? wpm : 0,
      accuracy,
      time: Math.floor(time)
    })
    
    if (input.length >= text.length) {
      finishTest()
    }
  }, [input])
  return (  <>     
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
   const finalName =
username.trim();
if(!finalName){
alert("Enter your name");
return;
}

localStorage.setItem("username",finalName);
    setShowNameInput(false);
    
  }}
>
  Join Room
</button>          
        </div>
      </div>
    )}
    <main className="min-h-screen bg-black text-white px-6 py-8">
  
  {/* Header */}
  <div className="max-w-7xl mx-auto flex items-start justify-between mb-16">
    <div>
      <h1 className="text-5xl font-bold">TypeCode</h1>
      <p className="text-zinc-500 mt-1">Code. Race. Win.</p>
    </div>

    <div className="flex gap-3">
      <button className="px-6 py-3 rounded bg-zinc-800">
        Restart
      </button>

      <button className="px-6 py-3 rounded bg-green-600">
        Create Room
      </button>

      <button className="px-6 py-3 rounded bg-zinc-800">
        Return to Room
      </button>
    </div>
  </div>
 
 <div className="max-w-7xl mx-auto flex justify-center gap-24 items-start">
   
<div className="w-[700px] flex flex-col items-center pt-16">

  <div className="text-zinc-500 text-xl mb-8">
  {timeLeft}s
</div>

  <div className="w-full max-w-3xl">
  <div className="text-xl leading-loose text-zinc-500 max-w-2xl mx-auto text-center "   
  >
    {text.split("").map((char, index) => {
      let color = "text-zinc-500";

      if (index < input.length) {
        color =
          input[index] === char
            ? "text-white"
            : "text-red-500";
      }

      return (
        <span key={index} className={color}>
          {char}
        </span>
      );
    })}
  </div>

  <input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  className="opacity-0 absolute"
  autoFocus
/>
</div>
 <div
  className="
    mt-10
    w-[430px]
    bg-[#0b0b13]
    border border-zinc-800
    rounded-3xl
    px-8 py-5
    flex justify-around
  "
>
  <div className="text-center">
    <h2 className="text-4xl font-semibold">{stats.wpm}</h2>
    <p className="text-zinc-500">WPM</p>
  </div>

  <div className="text-center">
  <h2 className="text-4xl font-semibold">
    {stats.accuracy}%
  </h2>
  <p className="text-zinc-500">Accuracy</p>
</div>

  <div className="text-center">
    <h2 className="text-4xl font-semibold">{timeLeft}s</h2>
    <p className="text-zinc-500">Time</p>
  </div>
</div>

</div>
 

     <div className="w-[350px] space-y-6">

<div className="bg-zinc-900 rounded-3xl p-5">
<h3 className="mb-4 text-lg font-semibold">
Participants
</h3>

{participants?.map((p,index)=>(
<div key={index}
className="py-2 border-b border-zinc-800">
{p}
</div>
))}
</div>


<div className="bg-zinc-900 rounded-3xl p-5">
<h3 className="mb-4 text-lg font-semibold">
Leaderboard
</h3>

{leaderboardData?.slice(0,5).map((user,index)=>(
<div
key={index}
className="flex justify-between py-2"
>
<span>{user.username}</span>
<span>{user.wpm} WPM</span>
</div>
))}
</div>


<div className="bg-zinc-900 rounded-3xl p-5">
<h3 className="mb-4 text-lg font-semibold">
Rooms
</h3>

{rooms.map((room)=>(
<div
key={room.id}
className="py-2"
>
{room.name}
</div>
))}
</div>


<StreakCalendar/>

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