let scores = []

export async function GET() {
  return Response.json(scores)
}

export async function POST(req) {
  const body = await req.json()

  const newScore = {
    wpm: body.wpm,
    accuracy: body.accuracy,
    date: new Date().toLocaleString()
  }

  scores.push(newScore)

  scores = scores
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, 10)

  return Response.json({ success: true })
}