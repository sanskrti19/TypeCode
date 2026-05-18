import {connectDB} from "@/lib/mongodb";
import Score from "@/models/Score";

export async function POST(req){

try{

await connectDB();

const body=await req.json();

const score=await Score.create(body);

return Response.json(score);

}

catch(error){

return Response.json(
{error:error.message},
{status:500}
);

}

}