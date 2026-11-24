import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Panel } from "@/components/jervis/Shell";
import { Markdown } from "@/components/jervis/Markdown";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Cheat Sheets — JERVIS" },
      { name: "description", content: "Quick revision notes for C, C++, Java, JavaScript, TypeScript, Python, SQL, Big-O and NeonDB." },
      { property: "og:title", content: "JERVIS Revision Cheat Sheets" },
      { property: "og:description", content: "Compact study notes for programming languages, algorithms and PostgreSQL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Notes,
});

const SHEETS: Record<string, string> = {
  "Big-O": `| Complexity | Example |\n|---|---|\n| O(1) | array index, hash lookup |\n| O(log n) | binary search |\n| O(n) | linear scan |\n| O(n log n) | merge / quick sort (avg) |\n| O(n²) | bubble / nested loops |\n| O(2ⁿ) | naive recursion (fib) |\n\n**Space**: count extra memory — recursion depth counts too.\n\n> Rule: drop constants and lower terms. Nested loops multiply, sequential loops add.`,
  "Data Structures": `- **Array** — O(1) access, O(n) insert\n- **Linked list** — O(1) insert at head, O(n) search\n- **Stack** (LIFO) push/pop O(1) — undo, recursion\n- **Queue** (FIFO) — BFS, scheduling\n- **Hash map** — avg O(1) get/set\n- **BST** — O(log n) balanced, O(n) worst\n- **Heap** — O(1) peek min/max, O(log n) push/pop\n- **Graph** — BFS (shortest unweighted), DFS, Dijkstra O((V+E) log V)`,
  C: "```c\n#include <stdio.h>\nint x = 5; int *p = &x;   // pointer\nprintf(\"%d %p\\n\", *p, p);\nint *a = malloc(n * sizeof(int)); free(a);\nchar s[20]; scanf(\"%19s\", s);\n```\n- `%d` int, `%f` float, `%c` char, `%s` string\n- Arrays decay to pointers; always `free` what you `malloc`.",
  "C++": "```cpp\n#include <bits/stdc++.h>\nvector<int> v = {3,1,2}; sort(v.begin(), v.end());\nmap<string,int> m; m[\"a\"]++;\nunordered_set<int> s; s.insert(4);\nclass A { public: virtual void f() {} };\n```\n- References `int &r = x;` can't be null\n- STL: vector, map, set, queue, stack, priority_queue",
  Java: "```java\nList<Integer> l = new ArrayList<>();\nMap<String,Integer> m = new HashMap<>();\nScanner sc = new Scanner(System.in);\nint n = sc.nextInt();\n```\n- OOP: encapsulation, inheritance, polymorphism, abstraction\n- `==` compares references; use `.equals()` for strings\n- Interfaces = contracts; abstract class = partial impl",
  JavaScript: "```js\nconst a = [1,2,3].map(x => x * 2).filter(x => x > 2);\nconst { name, ...rest } = obj;\nconst data = await fetch(url).then(r => r.json());\n```\n- `let/const` block scope; avoid `var`\n- `===` strict equality\n- Event loop: call stack → microtasks (promises) → macrotasks",
  TypeScript: "```ts\ntype User = { id: number; name: string; email?: string };\ninterface Repo<T> { get(id: number): Promise<T> }\nfunction first<T>(xs: T[]): T | undefined { return xs[0]; }\n```\n- Union `A | B`, intersection `A & B`\n- Narrow with `typeof`, `in`, discriminated unions\n- `unknown` > `any`",
  Python: "```python\nnums = [x*x for x in range(5)]\nd = {\"a\": 1}; d.get(\"b\", 0)\nfor i, v in enumerate(nums): print(i, v)\nclass Dog:\n    def __init__(self, name): self.name = name\n```\n- Lists mutable, tuples immutable\n- `dict`/`set` avg O(1)\n- Slicing `a[start:end:step]`",
  "SQL & NeonDB": "```sql\nCREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL);\nCREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), title TEXT);\nSELECT u.email, COUNT(p.id) FROM users u\nLEFT JOIN posts p ON p.user_id = u.id GROUP BY u.email;\nCREATE INDEX idx_posts_user ON posts(user_id);\n```\n- Relations: 1–1, 1–many (FK), many–many (junction table)\n- Index columns used in WHERE / JOIN\n- **NeonDB**: serverless Postgres. Connection string:\n  `postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require`\n- Use the *pooled* host (`-pooler`) for serverless apps; keep the string in an env variable.",
};

function Notes() {
  const keys = Object.keys(SHEETS);
  const [active, setActive] = useState(keys[0]!);
  return (
    <Shell>
      <div className="mb-4 flex flex-wrap gap-2">
        {keys.map((k) => <button key={k} onClick={() => setActive(k)} className={`hud-chip ${active === k ? "hud-btn-active" : ""}`}>{k}</button>)}
      </div>
      <Panel title={active}><Markdown>{SHEETS[active]!}</Markdown></Panel>
      <p className="mt-3 text-xs text-muted-foreground">Need more depth? Ask JERVIS on the Core page — e.g. "Explain {active} with an example".</p>
    </Shell>
  );
}
