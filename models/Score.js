import mongoose from "mongoose";

const ScoreSchema=new mongoose.Schema({

username:{
type:String,
required:true
},

wpm:{
type:Number,
required:true
},

accuracy:{
type:Number,
required:true
},

createdAt:{
type:Date,
default:Date.now
}

});

export default mongoose.models.Score ||
mongoose.model(
"Score",
ScoreSchema
);