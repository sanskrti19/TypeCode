import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Room from "@/models/Room";
import { getUserFromToken } from "@/lib/auth"; // assuming you have this

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const room = await Room.create({
      name: body.name || "Typing Room",
      createdBy: user._id
    });

    return NextResponse.json({
      success: true,
      roomId: room._id
    });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}