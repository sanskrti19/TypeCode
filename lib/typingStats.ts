export interface TypingStats {
  wpm: number;
  accuracy: number;
  time: number;
  correct: number;
  mistakes: number;
}

export function computeTypingStats(
  input: string,
  text: string,
  startTime: number | null
): TypingStats {
  if (!startTime) {
    return { wpm: 0, accuracy: 100, time: 0, correct: 0, mistakes: 0 };
  }

  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === text[i]) correct++;
  }

  const mistakes = input.length - correct;
  const accuracy =
    input.length === 0 ? 100 : Math.round((correct / input.length) * 100);
  const time = (Date.now() - startTime) / 1000;
  const wpm = Math.round((correct / 5) / (time / 60));

  return {
    wpm: Number.isFinite(wpm) ? wpm : 0,
    accuracy,
    time: Math.floor(time),
    correct,
    mistakes,
  };
}
