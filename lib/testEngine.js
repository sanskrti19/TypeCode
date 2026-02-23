import { createTypingEngine } from "./typingEngine.js"

const engine = createTypingEngine("hello")

engine.type("h")
engine.type("e")
engine.type("x")

console.log(engine.getState())
console.log(engine.getStats())