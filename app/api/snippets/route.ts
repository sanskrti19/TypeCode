 

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Snippet from "@/models/Snippet";
 
async function getDailyChallenge(filter: object) {
  const today = new Date().toISOString().split("T")[0];
  const seed = today.split("-").reduce((acc, v) => acc + parseInt(v), 0);
  const total = await Snippet.countDocuments(filter);
  if (!total) return null;
  return Snippet.findOne(filter).skip(seed % total).lean();
}

 
async function getRandom(filter: object, count: number) {
  return Snippet.aggregate([
    { $match: filter },
    { $sample: { size: count } },
  ]);
}

 

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;

    const language   = searchParams.get("language")   || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const topic      = searchParams.get("topic")      || undefined;
    const pattern    = searchParams.get("pattern")    || undefined;
    const id         = searchParams.get("id")         || undefined;
    const daily      = searchParams.get("daily") === "true";
    const catalog    = searchParams.get("catalog") === "true";
    const count      = Math.min(parseInt(searchParams.get("count") || "1"), 20);

    
    if (catalog) {
      const [languages, topics, patterns] = await Promise.all([
        Snippet.distinct("language", { isActive: true }),
        Snippet.distinct("topic",    { isActive: true, ...(language ? { language } : {}) }),
        Snippet.distinct("pattern",  { isActive: true, ...(language ? { language } : {}), ...(topic ? { topic } : {}) }),
      ]);
      return NextResponse.json({ languages, topics, patterns });
    }

    
    if (id) {
      const snippet = await Snippet.findOne({ id, isActive: true }).lean();
      if (!snippet) return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
      return NextResponse.json(snippet);
    }

   
    const filter: Record<string, unknown> = { isActive: true };
    if (language)   filter.language   = language;
    if (difficulty) filter.difficulty = difficulty;
    if (topic)      filter.topic      = topic;
    if (pattern)    filter.pattern    = pattern;

     
    if (daily) {
      const snippet = await getDailyChallenge(filter);
      if (!snippet) return NextResponse.json({ error: "No snippet found" }, { status: 404 });
      return NextResponse.json(snippet);
    }
 
    const snippets = await getRandom(filter, count);
    if (!snippets.length) return NextResponse.json({ error: "No snippet found" }, { status: 404 });

 
    const ids = snippets.map((s: any) => s._id);
    Snippet.updateMany({ _id: { $in: ids } }, { $inc: { timesPlayed: 1 } }).exec();
 
    return NextResponse.json(count === 1 ? snippets[0] : snippets);

  } catch (err) {
    console.error("[/api/snippets] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}