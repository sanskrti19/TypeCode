import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";

export async function GET() {
  await connectDB();

  const scores = await Score.aggregate([
    { $sort: { wpm: -1, createdAt: -1 } },
    {
      $group: {
        _id: "$username",
        username: { $first: "$username" },
        wpm: { $first: "$wpm" },
        accuracy: { $first: "$accuracy" },
      },
    },
    { $sort: { wpm: -1 } },
    { $limit: 10 },
  ]);

  return Response.json(scores);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  await Score.create(body);
  return Response.json({ success: true });
}
