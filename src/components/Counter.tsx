import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
      onClick={() => setCount((c) => c + 1)}
    >
      Count: {count}
    </button>
  );
}
