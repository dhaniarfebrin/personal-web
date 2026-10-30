export default function Suggestions({ questions, onPick }: { questions: string[]; onPick: (q: string) => void }) {
  return (
    <ul class="mt-3 flex flex-wrap gap-2">
      {questions.map((q) => (
        <li key={q}>
          <button
            type="button"
            onClick={() => onPick(q)}
            class="min-h-11 px-3 text-left text-sm text-ink border border-hairline-strong hover:bg-surface-soft"
          >
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}
