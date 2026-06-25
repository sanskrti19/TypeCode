"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRandomSnippet } from "@/lib/useSnippet";
import { computeTypingStats, type TypingStats } from "@/lib/typingStats";

const TEST_DURATION = 30;

export function useTypingEngine(onComplete?: (stats: TypingStats) => void) {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    time: 0,
    correct: 0,
    mistakes: 0,
  });
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const finishedRef = useRef(false);
  const isRunningRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const textRef = useRef("");
  const inputRef = useRef("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const finishTest = useCallback(() => {
    if (hasSubmittedRef.current || finishedRef.current) return;
    hasSubmittedRef.current = true;
    finishedRef.current = true;

    const finalStats = computeTypingStats(
      inputRef.current,
      textRef.current,
      startTimeRef.current
    );

    setStats(finalStats);
    setFinished(true);
    setIsRunning(false);
    isRunningRef.current = false;
    onCompleteRef.current?.(finalStats);
  }, []);

  const resetTest = useCallback(() => {
    hasSubmittedRef.current = false;
    finishedRef.current = false;
    isRunningRef.current = false;
    startTimeRef.current = null;

    setText(getRandomSnippet());
    setInput("");
    setStats({ wpm: 0, accuracy: 100, time: 0, correct: 0, mistakes: 0 });
    setTimeLeft(TEST_DURATION);
    setIsRunning(false);
    setFinished(false);
    setStartTime(null);
  }, []);

  useEffect(() => {
    resetTest();
  }, [resetTest]);

  useEffect(() => {
    if (!isRunning || finished) return;
    if (timeLeft === 0) {
      finishTest();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRunning, timeLeft, finished, finishTest]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        if (target.id !== "typingInput") return;
      }

      if (finishedRef.current) return;

      if (e.key === " ") e.preventDefault();

      if (e.key === "Backspace") {
        e.preventDefault();
        setInput((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!isRunningRef.current) {
          const now = Date.now();
          isRunningRef.current = true;
          startTimeRef.current = now;
          setIsRunning(true);
          setStartTime(now);
        }
        setInput((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!startTime) return;

    const nextStats = computeTypingStats(input, text, startTime);
    setStats(nextStats);

    if (input.length >= text.length && text.length > 0) {
      finishTest();
    }
  }, [input, text, startTime, finishTest]);

  return {
    text,
    input,
    stats,
    timeLeft,
    isRunning,
    finished,
    resetTest,
    finishTest,
  };
}
