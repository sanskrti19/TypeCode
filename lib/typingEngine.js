export function createTypingEngine(text) {
  const state = {
    text,
    input: "",
    index: 0,
    errors: 0,
    startTime: null,
    finished: false
    


  }
  

  function getStats() {
  if (!state.startTime) return { wpm: 0, accuracy: 100, time: 0 }

  const elapsed = (Date.now() - state.startTime) / 1000
  const words = state.input.length / 5
  const wpm = elapsed > 0 ? Math.round((words / elapsed) * 60) : 0

  const accuracy =
    state.input.length === 0
      ? 100
      : Math.round(
          ((state.input.length - state.errors) / state.input.length) * 100
        )

  return { wpm, accuracy, time: Math.floor(elapsed) }
}

  function startTimer() {
    if (!state.startTime) {
      state.startTime = Date.now()
    }
  }

  function type(char) {
    if (state.finished) return state

    startTimer()

    const expected = state.text[state.index]

    if (char !== expected) {
      state.errors++
    }

    state.input += char
    state.index++

    if (state.index >= state.text.length) {
      state.finished = true
    }

    return { ...state }
  }

  function backspace() {
    if (state.index === 0) return state

    state.input = state.input.slice(0, -1)
    state.index--
    return { ...state }
  }

  function getState() {
    return { ...state }
  }

  return {
    type,
    backspace,
    getState,
     getStats
  }
}