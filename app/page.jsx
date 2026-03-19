import TypingBox from "@/components/TypingBox"
import StreakCalendar from "@/components/StreakCalendar"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-6">

      <div className="flex gap-6 max-w-8xl mx-auto">

       
        <div className="flex-1 flex items-center justify-center">
          <TypingBox />
        </div>

         
        <div className="w-[320px] sticky top-100 h-fit">
          <StreakCalendar />
        </div>

      </div>

    </main>
  )
}