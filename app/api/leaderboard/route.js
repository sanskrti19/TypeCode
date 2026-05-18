import {connectDB} from "@/lib/mongodb";
import Score from "@/models/Score";

export async function GET(){

 await connectDB();

 const scores=
 await Score
 .find()
 .sort({wpm:-1})
 .limit(10);

 return Response.json(scores);

}

export async function POST(req){

 await connectDB();

 const body=
 await req.json();

 await Score.create(body);

 return Response.json({
 success:true
 });

}