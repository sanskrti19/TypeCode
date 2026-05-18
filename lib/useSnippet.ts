"use client";

import { useEffect, useState } from "react";
import snippets from "@/data/snippets.json";

export function getRandomSnippet() {
  const random =
    snippets[
      Math.floor(Math.random() * snippets.length)
    ];

  return random.code;
}

export function useSnippet() {
  const [code, setCode] = useState("");

  const refresh = () => {
    setCode(getRandomSnippet());
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    code,
    refresh,
  };
}