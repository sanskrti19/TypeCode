import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RoomParticipant from "@/models/RoomParticipant";
import Room from "@/models/Room";
import { getUserFromToken } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await Room.findById(params.id);
    if (!room || !room.isActive) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    await RoomParticipant.updateOne(
      { userId: user._id, roomId: params.id },
      { $setOnInsert: { userId: user._id, roomId: params.id } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}