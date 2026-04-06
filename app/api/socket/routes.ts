import { NextResponse } from "next/server";
import { initSocket } from "@/lib/socket";

export async function GET(req: any) {
  if (!global.io) {
    global.io = initSocket(req.socket.server);
  }

  return NextResponse.json({ ok: true });
}