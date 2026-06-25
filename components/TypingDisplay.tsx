"use client";

interface TypingDisplayProps {
  text: string;
  input: string;
}

export default function TypingDisplay({ text, input }: TypingDisplayProps) {
  if (!text) {
    return (
      <div className="font-mono text-text-sub text-center animate-pulse">
        loading snippet…
      </div>
    );
  }

  const words = text.split(" ");

  let charIndex = 0;

  return (
    <div
      onClick={() => document.getElementById("typingInput")?.focus()}
      className="font-mono text-[1.35rem] md:text-[1.5rem] leading-[1.9] cursor-text select-none w-full"
    >
      {words.map((word, wordIdx) => {
        const wordStart = charIndex;
        charIndex += word.length;
        const spaceIndex = charIndex;
        charIndex += 1;

        return (
          <span key={wordIdx} className="inline-block mr-[0.55em] mb-[0.25em]">
            {word.split("").map((char, i) => {
              const idx = wordStart + i;
              return (
                <Char key={i} char={char} index={idx} input={input} text={text} />
              );
            })}
            {wordIdx < words.length - 1 && (
              <Char
                char=" "
                index={spaceIndex}
                input={input}
                text={text}
                isSpace
              />
            )}
          </span>
        );
      })}
      {input.length >= text.length && text.length > 0 && (
        <span className="caret-block" />
      )}
      <input
        id="typingInput"
        readOnly
        tabIndex={0}
        autoFocus
        aria-hidden="true"
        className="absolute opacity-0 w-px h-px pointer-events-none"
      />
    </div>
  );
}

function Char({
  char,
  index,
  input,
  text,
  isSpace,
}: {
  char: string;
  index: number;
  input: string;
  text: string;
  isSpace?: boolean;
}) {
  const isCurrent = index === input.length;
  const isTyped = index < input.length;
  const isCorrect = isTyped && input[index] === text[index];

  let className = "text-text-sub";

  if (isTyped) {
    className = isCorrect ? "text-correct" : "text-incorrect";
  }

  if (isCurrent) {
    return (
      <span className="relative caret-before text-text-main">
        {isSpace ? "\u00A0" : char}
      </span>
    );
  }

  return <span className={className}>{isSpace ? "\u00A0" : char}</span>;
}
