import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RoomParticipant from "@/models/RoomParticipant";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const participants = await RoomParticipant.find({
    roomId: params.id
  }).populate("userId", "username avatar");

  return NextResponse.json({ participants });
}