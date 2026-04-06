export async function POST() {
  const roomId = Math.random().toString(36).substring(2, 9)

  return Response.json({ roomId })
}