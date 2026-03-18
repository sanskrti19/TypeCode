 import express from "express";

 
import {   getMonthlyActivity } from "@/controllers/streakController"



const router = express.Router()

router.post("/log", logPractice)
router.get("/month", getMonthlyActivity)

export default router
import { logPractice } from "@/controllers/streakController"

export async function POST(req: Request) {

  return logPractice(req)
}

