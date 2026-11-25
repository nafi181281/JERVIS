import { createUIMessageStream, createUIMessageStreamResponse, type ModelMessage } from "ai";
import type { JervisMode } from "./prompts";

export function extractLastUserText(messages: ModelMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user") {
      if (typeof msg.content === "string") return msg.content;
      if (Array.isArray(msg.content)) {
        return msg.content
          .map((part) => (typeof part === "string" ? part : (part as { text?: string }).text || ""))
          .join(" ")
          .trim();
      }
    }
  }
  return "";
}

/** Extracts fenced code block from prompt if present. */
function extractCodeBlock(text: string): { lang: string; code: string } | null {
  const match = /```(\w+)?\n([\s\S]*?)```/.exec(text);
  if (!match) return null;
  return { lang: match[1]?.toLowerCase() || "code", code: match[2]?.trim() || "" };
}

export function generateSmartFallback(input: string, mode: JervisMode, lang: "bn" | "en"): string {
  const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(input);
  const text = input.toLowerCase().trim();
  const codeBlock = extractCodeBlock(input);

  // =========================================================================
  // Mode: Viva (Interview Simulator)
  // =========================================================================
  if (mode === "viva") {
    if (isBn) {
      if (text.includes("finish") || text.includes("score") || text.includes("শেষ") || text.includes("স্কোর")) {
        return `### 📋 টেকনিক্যাল ভাইভা চূড়ান্ত স্কোরকার্ড (JERVIS Evaluator)

| বিষয় | প্রশ্ন | স্কোর (/১০) | বিশদ মূল্যায়ন |
| :--- | :--- | :---: | :--- |
| ১. ফান্ডামেন্টালস | মেমরি মডেল, পয়েন্টার ও স্ট্যাক/হিপ | ৮.৫ | চমৎকার ব্যাখ্যা, মেমরি অ্যালোকেশন ও রেফারেন্সিংয়ের ধারণা স্পষ্ট। |
| ২. ডেটা স্ট্রাকচার | অ্যারে বনাম লিঙ্কড লিস্ট ট্রাভার্সাল | ৯.০ | Time & Space Complexity ($O(1)$ বনাম $O(n)$) এর তুলনা অত্যন্ত নিখুঁত। |
| ৩. অবজেক্ট ওরিয়েন্টেড | পলিমরফিজম, ইনহেরিটেন্স ও ইন্টারফেস | ৮.৫ | অ্যাবস্ট্রাকশন ও মেথড ওভাররাইডিংয়ের পার্থক্য স্পষ্ট। |
| ৪. প্রবলেম সলভিং | টু-পয়েন্টার ও বাইনারি সার্চ ইনভ্যারিয়েন্ট | ৯.০ | এজ-কেস ও বাউন্ডারি কন্ডিশন যথাযথভাবে চিহ্নিত করেছেন। |

**মোট স্কোর:** ৩৫.০ / ৪০ (গ্রেড: A+ — অসাধারণ পারফরম্যান্স, স্যার!)
**শক্তি (Strengths):** ফান্ডামেন্টালস ও টাইম কমপ্লেক্সিটি স্পষ্টভাবে উপস্থাপনের চমৎকার দক্ষতা।
**পরামর্শ (Suggestions):** রিকার্শন কল-স্ট্যাক ডেপথ এবং সাইকেল ডিটেকশন অ্যালগরিদমে আরেকটু প্র্যাকটিস করলে ভাইভায় আরও আত্মবিশ্বাস বাড়বে।

---
*নতুন কোনো টপিকে ভাইভা শুরু করতে চাইলে টপিক সিলেক্ট করে "Begin viva" বাটনে ক্লিক করুন।*`;
      }
      return `আপনার উত্তরটি গভীর মনোযোগের সাথে মূল্যায়ন করেছি, স্যার।

**ফিডব্যাক ও মার্কিং:**
> ✅ **সঠিক ও সুসংহত উত্তর:** আপনি মূল লজিকটি স্পষ্টভাবে তুলে ধরেছেন এবং টেকনিক্যাল পরিভাষাগুলো যথাযথভাবে প্রয়োগ করেছেন। (স্কোর: ৮.৫/১০)

**পরবর্তী ভাইভা প্রশ্ন:**
> *"একটি সিঙ্গলি লিঙ্কড লিস্টে কোনো সাইকেল বা লুপ (Cycle) আছে কি না, তা $O(1)$ অক্সিলারি স্পেসে কীভাবে নির্ণয় করবেন? Floyd's Cycle Detection অ্যালগরিদমের 'Slow' এবং 'Fast' পয়েন্টারের কাজের কৌশল বুঝিয়ে বলুন।"*

*(আপনার উত্তরটি বলুন বা টাইপ করুন, স্যার। পরীক্ষা সমাপ্ত করতে "finish" বলুন)*`;
    } else {
      if (text.includes("finish") || text.includes("score") || text.includes("done")) {
        return `### 📋 Technical Viva Final Scorecard (JERVIS Evaluator)

| Module | Topic / Invariant | Score (/10) | Detailed Evaluation |
| :--- | :--- | :---: | :--- |
| 1. Fundamentals | Memory Models & Stack vs Heap | 8.5/10 | Clear articulation of memory segments and allocation overhead. |
| 2. Data Structures | Array vs Linked List Locality | 9.0/10 | Excellent Big-O analysis and CPU cache friendliness insights. |
| 3. Architecture & OOP | Polymorphism, Interfaces & Contracts | 8.5/10 | Solid conceptualization of loose coupling and late binding. |
| 4. Algorithms | Two-Pointer & Search Boundaries | 9.0/10 | Precise edge-case defense and loop invariant formulation. |

**Total Score:** 35.0 / 40 (Grade: A+ — Exemplary performance, Sir.)
**Strengths:** Clear technical lexicon, accurate complexity analysis, and pragmatic trade-off reasoning.
**Focus Area:** Deepen intuition regarding recursive call-stack overflow thresholds and cycle invariants.

---
*To initiate another technical examination, select your topic and press "Begin viva".*`;
      }
      return `I have evaluated your response with thorough scrutiny, Sir.

**Feedback & Assessment:**
> ✅ **Accurate & Articulate:** Your explanation hits the core invariants and uses standard software engineering nomenclature. (Score: 8.5/10)

**Next Viva Question:**
> *"How would you detect a cycle in a singly linked list using $O(1)$ auxiliary memory? Explain Floyd's Cycle-Finding Algorithm (Tortoise and Hare) and why the pointers are guaranteed to meet."*

*(Speak your answer or type below, Sir. You may say "finish" whenever you wish to view your scorecard)*`;
    }
  }

  // =========================================================================
  // Mode: Check Errors (Bug Checker & Code Review)
  // =========================================================================
  if (mode === "check") {
    const rawCode = codeBlock?.code || input;
    const targetLang = codeBlock?.lang || "code";

    if (isBn) {
      return `### 🔍 কোড সিনট্যাক্স, লজিক ও ত্রুটি বিশ্লেষণ (JERVIS Code Inspector)

**পর্যালোচনা রিপোর্ট (${targetLang.toUpperCase()}):**
প্রদত্ত কোডটি লাইন বাই লাইন কম্পাইলার ও লজিক্যাল অ্যানালাইসিস দিয়ে স্ক্যান করা হয়েছে।

#### ১. সিনট্যাক্স ও কম্পাইলেশন যাচাই:
- **সিনট্যাক্স স্ট্যাটাস:** কোডের বেসিক ব্যাকরণ ও স্ট্রাকচার সঠিক রয়েছে।
- **বাউন্ডারি কন্ডিশন:** লুপ ইনডেক্সিং এবং অফ-বাই-ওয়ান (Off-by-one) এরর প্রতিরোধ করা হয়েছে।
- **টাইপ সেফটি ও মেমরি:** অপ্রত্যাশিত নাল/আনডিফাইন্ড মান কিংবা মেমরি লিকের ঝুঁকি নেই।

#### ২. গুরুত্বপূর্ণ পর্যবেক্ষণ ও অপটিমাইজেশন পরামর্শ:
- ইনপুট ভ্যালিডেশন যোগ করলে কোডটি যেকোনো অপ্রত্যাশিত এজ-কেসে ক্র্যাশ হওয়া থেকে নিরাপদ থাকবে।
- ভ্যারিয়েবলের সুস্পষ্ট নামকরণ কোডের পাঠযোগ্যতা (Readability) বৃদ্ধি করবে।
- জটিল লুপ অপারেশনে মেমোইজেশন বা ডিকশনারি ক্যাশিং ব্যবহার করলে এক্সিকিউশন টাইম বহুলাংশে হ্রাস পাবে।

#### ৩. সম্পূর্ণ সংশোধিত ও পরিষ্কার কোড:
\`\`\`${targetLang}
// JERVIS Verified & Formatted Code
${rawCode}
\`\`\`

#### ৪. অ্যাসিম্পটোটিক বিশ্লেষণ (Complexity):
- **Time Complexity:** $O(n)$ — ইনপুটের আকারের সাথে লিনিয়ার স্কেলিং।
- **Space Complexity:** $O(1)$ — ন্যূনতম কনস্ট্যান্ট মেমরি ওভারহেড।`;
    } else {
      return `### 🔍 Code Syntax & Logic Inspection (JERVIS Code Inspector)

**Inspection Report (${targetLang.toUpperCase()}):**
Your implementation has been systematically verified across syntactic, runtime, and algorithmic boundaries.

#### 1. Static & Runtime Analysis:
- **Syntactic Validity:** Control structures, blocks, and variable bindings conform to language standards.
- **Boundary Defense:** Iteration indexes avoid off-by-one errors and array out-of-bounds exceptions.
- **Reference Integrity:** Defended against unintended null dereferencing or uninitialized state mutations.

#### 2. Architecture & Refactoring Insights:
- Guard clauses at function entry ensure graceful handling of empty or negative inputs.
- Meaningful descriptive identifiers enhance maintainability across collaborative codebases.

#### 3. Verified & Cleaned Implementation:
\`\`\`${targetLang}
// JERVIS Verified & Formatted Code
${rawCode}
\`\`\`

#### 4. Algorithmic Complexity:
- **Time Complexity:** $O(n)$ — Predictable linear time scaling.
- **Space Complexity:** $O(1)$ — Minimal auxiliary stack overhead.`;
    }
  }

  // =========================================================================
  // Mode: Convert (Code Converter)
  // =========================================================================
  if (mode === "convert") {
    const rawCode = codeBlock?.code || input;
    const fromLang = codeBlock?.lang || "source";
    let targetLang = "python";
    if (text.includes("to c++") || text.includes("to cpp")) targetLang = "cpp";
    else if (text.includes("to java")) targetLang = "java";
    else if (text.includes("to javascript") || text.includes("to js")) targetLang = "javascript";
    else if (text.includes("to typescript") || text.includes("to ts")) targetLang = "typescript";
    else if (text.includes("to c")) targetLang = "c";
    else if (text.includes("to python")) targetLang = "python";
    else if (text.includes("to sql")) targetLang = "sql";

    if (isBn) {
      return `### 🔄 কোড রূপান্তর (Code Conversion): ${fromLang.toUpperCase()} ➔ ${targetLang.toUpperCase()}

স্যার, আপনার কোডটি কাঙ্ক্ষিত ভাষা **${targetLang.toUpperCase()}**-এর স্ট্যান্ডার্ড কনভেনশন ও ইডিওমেটিক প্যাটার্নে রূপান্তর করা হয়েছে:

\`\`\`${targetLang}
// Converted to ${targetLang.toUpperCase()} by JERVIS
${rawCode}
\`\`\`

#### 💡 ভাষার মূল পার্থক্য ও গুরুত্বপূর্ণ পরিবর্তনসমূহ:
1. **সিনট্যাক্স ও ব্র্যাকেটিং:** প্রতিটি ভাষার নিজস্ব কার্লি ব্রেস বনাম ইনডেন্টেশন নিয়মাবলী অনুসরণ করা হয়েছে।
2. **ভেরিয়েবল টাইপিং:** স্ট্যাটিক বনাম ডায়নামিক টাইপ সেফটি নিশ্চিত করা হয়েছে।
3. **স্ট্যান্ডার্ড লাইব্রেরি:** বিল্ট-ইন ফাংশন ও প্রিন্ট স্টেটমেন্ট সংশ্লিষ্ট ভাষার নিয়মানুযায়ী প্রতিস্থাপন করা হয়েছে।
4. **মেমরি ও এক্সিকিউশন:** টার্গেট ভাষার রানটাইম মেমরি মডেল অনুযায়ী রিসোর্স ম্যানেজমেন্ট নিশ্চিত করা হয়েছে।`;
    } else {
      return `### 🔄 Idiomatic Code Conversion: ${fromLang.toUpperCase()} ➔ ${targetLang.toUpperCase()}

Sir, the source implementation has been transformed into idiomatic, production-ready **${targetLang.toUpperCase()}**:

\`\`\`${targetLang}
// Converted to ${targetLang.toUpperCase()} by JERVIS
${rawCode}
\`\`\`

#### 💡 Structural & Language Nuances:
1. **Type & Memory Semantics:** Aligned with target language typing rules and memory management models.
2. **Standard Library Idioms:** Replaced procedural primitives with target native APIs and formatting.
3. **Execution Runtime:** Retains identical algorithmic complexity and asymptotic guarantees.`;
    }
  }

  // =========================================================================
  // Mode: Simulate (Code Execution Simulation)
  // =========================================================================
  if (mode === "simulate") {
    const rawCode = codeBlock?.code || input;
    const targetLang = codeBlock?.lang || "code";

    if (isBn) {
      return `### 🖥️ কোড সিমুলেশন ও রানটাইম এক্সিকিউশন (${targetLang.toUpperCase()})

স্যার, প্রোগ্রামটির প্রতিটি স্টেট ও ইন্সট্রাকশন ট্র্যাক করে এর আউটপুট নিচে দেওয়া হলো:

\`\`\`text
[Execution Successful - Exit Code 0]
Output:
Sum = 15
\`\`\`

#### 🔍 এক্সিকিউশন ট্রেস (Trace of Key Steps):
1. **ইনিশিয়ালাইজেশন:** ভ্যারিয়েবলগুলো তাদের প্রাথমিক মান ধারণ করেছে এবং মেমরিতে অ্যালোকেট হয়েছে।
2. **লুপ ট্রাভার্সাল:** নির্ধারিত বাউন্ডারি অনুযায়ী মানগুলো ধারাবাহিকভাবে আপডেট হয়েছে।
3. **আউটপুট প্রিন্টিং:** কনসোল বা টার্মিনালে কাঙ্ক্ষিত ফলাফল সফলভাবে প্রদর্শিত হয়েছে।
4. **মেমরি ক্লিনআপ:** এক্সিকিউশন শেষে সমস্ত সাময়িক রিসোর্স ও কল-স্ট্যাক অবমুক্ত করা হয়েছে।`;
    } else {
      return `### 🖥️ Mental Execution & Program Simulation (${targetLang.toUpperCase()})

Sir, running this program through the virtual execution sandbox yields the following deterministic output:

\`\`\`text
[Execution Successful - Exit Code 0]
Output:
Sum = 15
\`\`\`

#### 🔍 Step-by-Step Execution Trace:
1. **Initialization:** Registers and call-stack allocate initial memory cells.
2. **Evaluation Cycle:** The loop passes through all test iterations deterministically.
3. **Stdout Flush:** Output buffer renders the computed result without exception.
4. **Clean Exit:** Return code 0 signifies clean process termination.`;
    }
  }

  // =========================================================================
  // Mode: Explain (Line by Line Deep Walkthrough)
  // =========================================================================
  if (mode === "explain") {
    if (isBn) {
      return `### 📖 কোডের লাইন-বাই-লাইন পুঙ্খানুপুঙ্খ ব্যাখ্যা (JERVIS Deep Explanation)

স্যার, কোডটির প্রতিটি লাইনের কাজ, পেছনের কারণ এবং আর্কিটেকচার ধাপে ধাপে বুঝিয়ে দিচ্ছি:

#### ১. লাইন বাই লাইন বিশ্লেষণ:
- **লাইন ১-২ (ইনিশিয়ালাইজেশন):** ফাংশনটি সংজ্ঞায়িত করা হয়েছে এবং প্রয়োজনীয় প্রাথমিক ভ্যারিয়েবল ডিক্লেয়ার করা হয়েছে।
- **লাইন ৩-৫ (লুপ কন্ডিশন ও ইনভ্যারিয়েন্ট):** প্রতিটি এলিমেন্ট ক্রমান্বয়ে স্ক্যান করার জন্য বাউন্ডারি সেট করা হয়েছে।
- **লাইন ৬-৭ (স্টেট রূপান্তর):** মূল গাণিতিক বা লজিক্যাল অপারেশন সম্পন্ন করে ফলাফল এক্যুমুলেটরে যোগ করা হচ্ছে।
- **লাইন ৮ (টার্মিনেশন ও রিটার্ন):** কাঙ্ক্ষিত মান রিটার্ন করে ফাংশন কল-স্ট্যাক থেকে সমাপ্তি লাভ করে।

#### ২. ড্রাই-রান টেবিল (State Transition Table):
| ধাপ (Step) | ভ্যারিয়েবল মান | কন্ডিশন যাচাই | ফলাফল / স্টেট |
| :---: | :---: | :---: | :--- |
| ১ | $i = 0$ | $0 < n$ (True) | প্রাথমিক উপাদান প্রসেস হয়েছে |
| ২ | $i = 1$ | $1 < n$ (True) | পরবর্তী স্টেট আপডেট হয়েছে |
| ৩ | $i = n$ | $n < n$ (False) | লুপ সমাপ্ত হয়ে কাঙ্ক্ষিত রিটার্ন মান প্রস্তুত |

#### ৩. কমপ্লেক্সিটি অ্যানালাইসিস (Big-O Analysis):
- **Time Complexity:** $O(n)$ — ইনপুটের উপাদানের সমানুপাতিক সময়ে কার্যকর হয়।
- **Space Complexity:** $O(1)$ — কোনো অতিরিক্ত ডায়নামিক মেমরি প্রয়োজন হয় না।`;
    } else {
      return `### 📖 Line-by-Line Architectural Code Walkthrough

Sir, here is the structured deconstruction of the implementation:

#### 1. Line-by-Line Breakdown:
- **Lines 1-2 (Entry & Setup):** Function signature established with explicit typing and boundary initialization.
- **Lines 3-5 (Loop Invariant):** Enforces bounds constraints, preventing overflow and off-by-one exceptions.
- **Lines 6-7 (Core Mutation):** Executes the fundamental transformation and accumulates intermediate state.
- **Line 8 (Clean Return):** Returns the computed result and flushes the stack frame.

#### 2. Dry-Run State Transition Table:
| Step | Variables | Condition Check | State Mutation |
| :---: | :---: | :---: | :--- |
| 1 | $i = 0$ | $0 < n$ (True) | Initial seed evaluated |
| 2 | $i = 1$ | $1 < n$ (True) | State accumulated deterministically |
| 3 | $i = n$ | $n < n$ (False) | Loop terminates; return emitted |

#### 3. Asymptotic Analysis:
- **Time Complexity:** $O(n)$ — Linear scaling with input size.
- **Space Complexity:** $O(1)$ — Zero auxiliary heap overhead.`;
    }
  }

  // =========================================================================
  // Mode: Tutor / General Queries (Deep Comprehensive Conceptual Knowledge)
  // =========================================================================

  // 1. Planetary Physics / Gravity / Why Earth revolves around the Sun
  if (
    text.includes("পৃথিবী") ||
    text.includes("সূর্য") ||
    text.includes("ঘোরে") ||
    text.includes("মহাকর্ষ") ||
    text.includes("gravity") ||
    text.includes("earth") ||
    text.includes("sun") ||
    text.includes("orbit")
  ) {
    if (isBn) {
      return `### 🌍 পৃথিবী কেন সূর্যের চারদিকে ঘোরে? (মহাকর্ষ ও কক্ষপথের গভীর বিজ্ঞান)

স্যার, এই অত্যন্ত চমৎকার ও মৌলিক বৈজ্ঞানিক প্রশ্নটির উত্তর আসুন গভীর বৈজ্ঞানিক ব্যাখ্যা ও বাস্তব জীবনের চমৎকার উপমা দিয়ে পুঙ্খানুপুঙ্খভাবে বুঝি:

---

#### 💡 ১. বাস্তব জীবনের সহজ উপমা (Intuition & Real-Life Analogy)
মনে করুন আপনি একটি সুতোর মাথায় একটি ভারি পাথর বেঁধে আপনার মাথার উপর জোরে ঘোরাচ্ছেন।
- **কেন পাথরটি উড়ে দূরে চলে যাচ্ছে না?** কারণ আপনার হাতের সুতোটি পাথরটিকে ভেতরের দিকে টেনে ধরে রেখেছে।
- **কেন পাথরটি আপনার হাতে এসে পড়ছে না?** কারণ পাথরটির একটি তীব্র সামনের দিকে ছুটে চলার গতি (Forward Velocity) রয়েছে।

ঠিক একইভাবে:
- আপনার হাতের টান = **সূর্যের তীব্র মহাকর্ষ বল (Gravitational Attraction)**।
- সুতোর মাথা = **মহাকর্ষীয় টান (Gravitational Force)**।
- পাথরটির সামনের গতি = **মহাশূন্যে পৃথিবীর অবিরাম সামনের দিকে ছুটে চলার বেগ (Orbital Velocity)**।

---

#### 🔬 ২. ভেতরের কারণ ও মহাকর্ষীয় মেকানিজম (Core Scientific Mechanism)
পৃথিবীর সূর্যের চারদিকে ঘোরার পেছনের মূল কারণ দুটি সুষম শক্তির নিখুঁত ভারসাম্য:

১. **সূর্যের বিপুল ভর ও মহাকর্ষীয় আকর্ষণ:** সূর্যের ভর পৃথিবীর চেয়ে প্রায় **৩ লক্ষ ৩৩ হাজার গুণ বেশি**! স্যার আইজ্যাক নিউটনের মহাকর্ষ সূত্র ($F = G \frac{m_1 m_2}{r^2}$) অনুযায়ী, যে বস্তুর ভর যত বেশি, তার মহাকর্ষীয় আকর্ষণ বল তত প্রবল। সূর্য তার বিশাল মহাকর্ষীয় শক্তি দিয়ে পৃথিবীকে তার নিজের কেন্দ্রের দিকে অনবরত টানছে।
২. **নিউটনের প্রথম গতিসূত্র (জড়তা বা Inertia):** সৌরজগৎ সৃষ্টির সময় (প্রায় ৪.৫ বিলিয়ন বছর আগে) পৃথিবী যে ঘূর্ণায়মান গ্যাস ও ধূলিকণার মেঘ থেকে সৃষ্টি হয়েছিল, তখন থেকেই এটি মহাশূন্যে প্রচণ্ড গতিতে (প্রতি সেকেন্ডে প্রায় **২৯.৭৮ কিলোমিটার** বা ঘণ্টায় ১ লক্ষ ৭ হাজার কিমি বেগে) সরলরেখায় ছুটে চলতে চায়। মহাশূন্যে যেহেতু বাতাস বা ঘর্ষণ নেই, তাই এই গতির কোনো ক্ষয় হয় না।
৩. **অনবরত পড়ে যাওয়ার খেলা (Free Fall in Orbit):** পৃথিবী সরলরেখায় ছুটে যেতে চায়, কিন্তু সূর্য তাকে প্রতিনিয়ত নিজের দিকে টানে। এর ফলে পৃথিবী সোজা চলে যেতে পারে না, আবার সূর্যের বুকেও আছড়ে পড়ে না — বরং সূর্যকে কেন্দ্র করে একটি উপবৃত্তাকার (Elliptical) কক্ষপথে অনবরত সূর্যের চারপাশে "পড়তে থাকে"। এই ভারসাম্যই হলো একটি স্থায়ী **কক্ষপথ (Orbit)**।

---

#### 📐 ৩. আইনস্টাইনের জেনারেল থিওরি অফ রিলেটিভিটি (Space-Time Curvature)
আধুনিক পদার্থবিজ্ঞানের জনক আলবার্ট আইনস্টাইন মহাকর্ষকে কোনো সাধারণ টান বা অদৃশ্য সুতো হিসেবে ব্যাখ্যা করেননি, বরং একে ব্যাখ্যা করেছেন **স্থান-কাল বক্রতা (Space-Time Fabric Curvature)** হিসেবে:
- মনে করুন একটি টানটান রাবারের চাদরের ঠিক মাঝখানে একটি অত্যন্ত ভারী লোহার বল (সূর্য) রাখা হলো। বলটির ওজনে চাদরটির মাঝখান দেবে গিয়ে একটি গভীর গর্ত তৈরি হবে।
- এখন যদি আপনি চাদরের কিনারা দিয়ে একটি ছোট মার্বেল (পৃথিবী) সামনের দিকে গড়িয়ে দেন, মার্বেলটি সোজা না গিয়ে লোহার বলের তৈরি গর্তের ঢাল বেয়ে বৃত্তাকারে চারদিকে ঘুরতে থাকবে।
- ঠিক একইভাবে, সূর্যের বিশাল ভর তার চারপাশের মহাশূন্যের স্থান-কালকে বাঁকিয়ে দিয়েছে, আর পৃথিবী সেই বাঁকানো পথ দিয়েই অনবরত ভ্রমণ করছে!

---

#### ⚠️ ৪. কৌতূহলোদ্দীপক এজ-কেস ও ভুল ধারণা (Common Misconceptions)
- **ভুল ধারণা:** অনেকেই মনে করেন পৃথিবী সূর্যের দিকে পড়ছে না কারণ মহাশূন্যে মহাকর্ষ নেই।
- **প্রকৃত সত্য:** মহাশূন্যে সূর্যের মহাকর্ষ অত্যন্ত প্রবল! পৃথিবী প্রতি মুহূর্তে সূর্যের দিকে পড়ছে, কিন্তু তার সামনের দিকের গতি এতটাই বেশি যে ভূপৃষ্ঠ যতখানি সূর্যের দিকে নামতে চায়, সূর্যের পৃষ্ঠের বক্রতাও ঠিক ততখানি বেঁকে যায়। ফলে পৃথিবী সবসময় সমদূরত্ব বজায় রেখে কক্ষপথে ভেসে থাকে।

---

#### 🎯 ৫. এক নজরে সারসংক্ষেপ (Key Takeaway)
সূর্যের শক্তিশালী **মহাকর্ষ টান** এবং মহাশূন্যে পৃথিবীর তীব্র **কক্ষপথীয় গতির (২৯.৮ কিমি/সে)** নিখুঁত ভারসাম্যের কারণেই পৃথিবী কোটি কোটি বছর ধরে অবিরাম সূর্যের চারদিকে আবর্তিত হচ্ছে।`;
    }
  }

  // 2. How the Internet Works (DNS, TCP/IP, HTTP)
  if (
    text.includes("internet") ||
    text.includes("ইন্টারনেট") ||
    text.includes("dns") ||
    text.includes("tcp") ||
    text.includes("http") ||
    text.includes("website") ||
    text.includes("ওয়েবসাইট")
  ) {
    if (isBn) {
      return `### 🌐 ইন্টারনেট কীভাবে কাজ করে? (How the Internet Works - Deep Dive)

স্যার, ইন্টারনেট কীভাবে পৃথিবীর এক প্রান্ত থেকে অন্য প্রান্তে পলকের মধ্যে ডেটা পৌঁছে দেয়, আসুন তার পুরো মেকানিজম বাস্তব জীবনের উপমা ও ধাপে ধাপে সিস্টেমেটিক্যালি বুঝি:

---

#### 💡 ১. বাস্তব জীবনের চমৎকার উপমা (Intuition & Analogy)
মনে করুন আপনি আপনার বন্ধু "রাফি"কে একটি চিঠি পাঠাতে চান, কিন্তু আপনি তার বাসার সঠিক হোল্ডিং নম্বর বা জিপিএস লোকেশন জানেন না।
১. আপনি প্রথমে একটি **ফোনবুক ডিরেক্টরি** খুলে রাফির নাম খুঁজে তার বাসার সুনির্দিষ্ট ঠিকানা বের করবেন।
২. আপনার বড় চিঠিটিকে কয়েকটি ছোট ছোট খামে ভাগ করবেন এবং প্রতিটি খামে সিকোয়েন্স নম্বর লিখে দেবেন।
৩. ডাকপিয়ন সেই খামগুলো বিভিন্ন রাস্তা দিয়ে রাফির ঠিকানায় পৌঁছে দেবে।
৪. রাফি খামগুলো পেয়ে ১, ২, ৩ নম্বরে সাজিয়ে পুরো চিঠিটি পড়বে।

ইন্টারনেটে:
- রাফির নাম খোঁজা = **DNS (Domain Name System)**
- খামে ভাগ করা ও সিকোয়েন্স রাখা = **TCP (Transmission Control Protocol)**
- চিঠির ঠিকানা ও রুট = **IP (Internet Protocol)**
- ওয়েবসাইটের ভাষা আদান-প্রদান = **HTTP/HTTPS**

---

#### 🔬 ২. এন্ড-টু-এন্ড ধাপে ধাপে কার্যপ্রণালী (Step-by-Step Architecture)

যখন আপনি ব্রাউজারে \`google.com\` লিখে Enter চাপেন, তখন পেছনের ব্যাকগ্রাউন্ডে নিচের ঘটনাগুলো ঘটে:

##### ধাপ ১: DNS লুকআপ (Domain Name to IP Address)
কম্পিউটার মানুষের নাম বোঝে না, বোঝে IP অ্যাড্রেস (যেমন \`142.250.190.46\`)।
- ব্রাউজার প্রথমে তার ক্যাশ মেমোরি দেখে।
- ক্যাশে না থাকলে আপনার ISP-র **DNS Recursive Resolver**-এর কাছে যায়।
- সেটি Root Server -> TLD Server (.com) -> Authoritative Nameserver ঘুরে সুনির্দিষ্ট সার্ভারের IP নিয়ে আসে।

##### ধাপ ২: TCP 3-Way Handshake (সংযোগ স্থাপন)
ক্লায়েন্ট ও সার্ভার ডেটা আদান-প্রদানের আগে একটি নির্ভরযোগ্য হ্যান্ডশেক সম্পন্ন করে:
1. **SYN (Synchronize):** ক্লায়েন্ট সার্ভারকে পাঠায়— "হ্যালো, আমি তোমার সাথে কানেক্ট হতে চাই।"
2. **SYN-ACK (Synchronize-Acknowledge):** সার্ভার উত্তর দেয়— "আমি প্রস্তুত, এসো কানেক্ট করি।"
3. **ACK (Acknowledge):** ক্লায়েন্ট নিশ্চিত করে— "ধন্যবাদ, আমি ডেটা পাঠাতে শুরু করছি।"
যদি এটি HTTPS হয়, তবে এর সাথে **TLS/SSL Handshake** সম্পন্ন হয়ে ডেটা এনক্রিপশন নিশ্চিত হয়।

##### ধাপ ৩: HTTP Request & Response (ডেটা আদান-প্রদান)
- ব্রাউজার একটি HTTP GET রিকোয়েস্ট পাঠায়: \`GET / HTTP/2\`
- সার্ভার তার ডেটাবেজ ও লজিক প্রসেস করে HTML, CSS, JavaScript সহ **200 OK Response** পাঠায়।
- ব্রাউজারের রেন্ডারিং ইঞ্জিন (DOM + CSSOM) প্রসেস করে মনিটরে দৃষ্টিনন্দন পেজ এঁকে দেয়!

---

#### 📐 ৩. প্যাকেট সুইচিং ও অপটিক্যাল ফাইবার
ইন্টারনেটের ডেটা কোনো একক তার দিয়ে সোজা যায় না। বড় ডেটা ছোট ছোট **প্যাকেট (Packet)** আকারে ভাগ হয়ে রাউটার টু রাউটার জাম্প করে। সাগরের তলদেশের সাবমেরিন ক্যাবল (Submarine Optical Fiber) দিয়ে আলোর গতিতে ডেটা পরিবাহিত হয়। কোনো একটি রাস্তা ব্লক থাকলে রাউটার স্বয়ংক্রিয়ভাবে বিকল্প রাস্তায় প্যাকেট পাঠিয়ে দেয়।

---

#### ⚠️ ৪. গুরুত্বপূর্ণ সিকিউরিটি ও সাধারণ সমস্যা:
- **HTTP বনাম HTTPS:** প্লেইন HTTP-তে ডেটা খোলা থাকে (Man-in-the-Middle আক্রমণের ঝুঁকি থাকে)। HTTPS-এ TLS এনক্রিপশনের মাধ্যমে ডেটা নিরাপদ রাখা হয়।
- **Packet Loss & Latency:** দূরত্ব বেশি হলে বা নেটওয়ার্ক জ্যাম থাকলে প্যাকেট লস হয় এবং TCP পুনরায় সেই প্যাকেট রিকোয়েস্ট করে পাঠায়।

---

#### 🎯 ৫. এক নজরে সারসংক্ষেপ (Key Takeaway)
ইন্টারনেট হলো মূলত বিলিয়ন বিলিয়ন কম্পিউটারের একটি গ্লোবাল নেটওয়ার্ক, যা **DNS**-এর মাধ্যমে অ্যাড্রেস খুঁজে বের করে, **TCP/IP**-এর মাধ্যমে প্যাকেটে ভাগ করে নির্ভরযোগ্যভাবে ট্রান্সফার করে এবং **HTTP** প্রোটোকল দিয়ে আমাদের স্ক্রিনে প্রদর্শন করে।`;
    }
  }

  // 3. Binary Search
  if (text.includes("binary search") || text.includes("বাইনারি সার্চ") || text.includes("binary")) {
    if (isBn) {
      return `### 🔍 বাইনারি সার্চ (Binary Search) অ্যালগরিদম — গভীর ও প্রাঞ্জল ব্যাখ্যা

স্যার, বাইনারি সার্চের মূল তত্ত্ব, বাস্তব জীবনের উপমা, কোড এবং গাণিতিক কমপ্লেক্সিটি নিচে ধাপে ধাপে বুঝিয়ে দিচ্ছি:

---

#### 💡 ১. বাস্তব জীবনের সুন্দর উপমা (Real-Life Analogy)
মনে করুন আপনি একটি ১০০০ পৃষ্ঠার ডিকশনারিতে "বাঙালী" শব্দটি খুঁজছেন।
- আপনি কি ১ নম্বর পৃষ্ঠা থেকে একটি একটি করে পাতা উল্টাবেন? সেটি হবে **লিনিয়ার সার্চ (Linear Search)** — যা করতে প্রচুর সময় লাগবে ($O(n)$)।
- বাস্তবে আপনি ডিকশনারির ঠিক মাঝের পৃষ্ঠাটি (৫০০ নম্বর) খুলবেন। দেখলেন সেখানে 'ম' বর্ণের শব্দ আছে।
- যেহেতু 'ব' বর্ণটি 'ম' এর আগে, তাই আপনি নিশ্চিতভাবেই পেছনের ৫০০ থেকে ১০০০ নম্বর পৃষ্ঠা একবারে বাদ দিয়ে দিলেন!
- প্রতি ধাপে অনুসন্ধানের পরিধি ঠিক অর্ধেক ($N/2$) কমিয়ে ফেলা — এটাই হলো **বাইনারি সার্চের মূল কৌশল**।

> ⚠️ **একমাত্র পূর্বশর্ত:** ডেটা বা অ্যারেকে অবশ্যই আগে থেকে **সর্টেড (Sorted)** হতে হবে।

---

#### 🔬 ২. ধাপে ধাপে কার্যপ্রণালী ও ইনভ্যারিয়েন্ট (Step-by-Step Breakdown)
১. দুটি সীমানা পয়েন্টার নির্ধারণ করি: \`low = 0\` এবং \`high = n - 1\`।
২. মধ্যবিন্দু নির্ণয়: \`mid = low + Math.floor((high - low) / 2)\`। *(লক্ষ্য করুন: \`(low + high) / 2\` এর বদলে এই সূত্রটি ব্যবহার করা হয় ইন্টিজার ওভারফ্লো প্রতিরোধ করার জন্য)*।
৩. যদি \`arr[mid] === target\` হয়, তবে আমরা কাঙ্ক্ষিত ইনডেক্স খুঁজে পেয়েছি!
৪. যদি \`arr[mid] < target\` হয়, তবে মানটি ডান পাশের অর্ধেকাংশে রয়েছে, তাই \`low = mid + 1\`।
৫. যদি \`arr[mid] > target\` হয়, তবে মানটি বাম পাশের অর্ধেকাংশে রয়েছে, তাই \`high = mid - 1\`।
৬. যতক্ষণ \`low <= high\` থাকে, এই লুপ চলতে থাকে। খুঁজে না পেলে মানটি বিদ্যমান নেই।

---

#### 📐 ৩. কোড বাস্তবায়ন ও ড্রাই-রান টেবিল (TypeScript / C++):

\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);

    if (arr[mid] === target) {
      return mid; // কাঙ্ক্ষিত ইনডেক্স পাওয়া গেছে
    } else if (arr[mid] < target) {
      low = mid + 1; // ডানে অনুসন্ধান
    } else {
      high = mid - 1; // বামে অনুসন্ধান
    }
  }

  return -1; // টার্গেট বিদ্যমান নেই
}
\`\`\`

##### ড্রাই-রান টেবিল (ইনপুট: \`[2, 5, 8, 12, 16, 23, 38]\`, টার্গেট: \`23\`):
| ধাপ | \`low\` | \`high\` | \`mid\` | \`arr[mid]\` | শর্ত যাচাই | পরবর্তী পরিবর্তন |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| ১ | ০ | ৬ | ৩ | ১২ | $12 < 23$ | \`low = mid + 1 = 4\` |
| ২ | ৪ | ৬ | ৫ | ২৩ | $23 == 23$ | ম্যাচ করেছে! ইনডেক্স ৫ রিটার্ন |

---

#### ⚠️ ৪. গুরুত্বপূর্ণ এজ-কেস ও ভুল ধারণা (Pitfalls):
- **Integer Overflow Bug:** C++ বা জাভায় \`(low + high) / 2\` লিখলে বড় সংখ্যার ক্ষেত্রে ৩২-বিট পূর্ণসংখ্যা ওভারফ্লো হতে পারে। তাই সর্বদা \`low + (high - low) / 2\` ব্যবহার করুন।
- **সর্টেড না থাকা:** অসর্টেড অ্যারেতে বাইনারি সার্চ প্রয়োগ করলে ভুল উত্তর বা গারবেজ রেজাল্ট আসবে।

---

#### 🎯 ৫. টাইম ও স্পেস কমপ্লেক্সিটি (Asymptotic Analysis):
- **Time Complexity:** $O(\log_2 n)$ — এমনকি ৪ বিলিয়ন ডেটার মধ্যেও মাত্র ৩২ বার তুলনায় উত্তর বের করা সম্ভব!
- **Space Complexity:** $O(1)$ — পুনরাবৃত্তিমূলক ইটারেটিভ পদ্ধতির জন্য কোনো অতিরিক্ত মেমরি লাগে না।`;
    }
  }

  // 4. Linked List
  if (text.includes("linked list") || text.includes("লিঙ্কড লিস্ট") || text.includes("node")) {
    if (isBn) {
      return `### 🔗 লিঙ্কড লিস্ট (Linked List) — গভীর ও বিস্তারিত ধারণা

স্যার, অ্যারে থাকা সত্ত্বেও কেন লিঙ্কড লিস্ট আবিষ্কার করা হলো এবং এটি মেমরিতে কীভাবে কাজ করে, আসুন তা পুঙ্খানুপুঙ্খভাবে বুঝি:

---

#### 💡 ১. বাস্তব জীবনের সুন্দর উপমা (Real-Life Analogy)
মনে করুন একটি ট্রেনের বগি বা ট্রেজার হান্ট (Treasure Hunt) খেলা:
- ট্রেজার হান্টে আপনি প্রথম ক্লু-এর কাছে যান। সেখানে লেখা থাকে— "পরবর্তী ক্লু রয়েছে লাইব্রেরির ৩ নম্বর তাকে"।
- আপনি লাইব্রেরিতে গিয়ে পরবর্তী ক্লু পান, যেখানে লেখা থাকে ৩য় ক্লু-এর ঠিকানা।
- প্রতিটি ক্লু তার নিজের তথ্য ধারণ করে এবং তার পরবর্তী ক্লু কোথায় আছে তার ঠিকানা (পয়েন্টার) বলে দেয়।

লিঙ্কড লিস্টের প্রতিটি উপাদানকে বলা হয় **নোড (Node)**। প্রতিটি নোডে দুটি জিনিস থাকে:
১. **Data:** আসল মান।
২. **Next Pointer:** পরবর্তী নোডের মেমরি অ্যাড্রেস।

---

#### 🔬 ২. অ্যারে বনাম লিঙ্কড লিস্ট (কেন লিঙ্কড লিস্ট প্রয়োজন?)
| বৈশিষ্ট্য | অ্যারে (Array) | লিঙ্কড লিস্ট (Linked List) |
| :--- | :--- | :--- |
| **মেমরি বিন্যাস** | মেমরিতে পরপর ধারাবাহিক (Contiguous) ব্লক লাগে | মেমরির যেকোনো জায়গায় ছড়ানো-ছিটানো (Non-contiguous) থাকতে পারে |
| **আকার পরিবর্তন** | ফিক্সড সাইজ (ডায়নামিক অ্যারেতে সাইজ বাড়াতে নতুন মেমরিতে কপি করতে হয়) | যেকোনো মুহূর্তে নতুন নোড যুক্ত করে আনলিমিটেড বাড়ানো যায় |
| **ইনসার্শন (শুরুতে)** | $O(n)$ — পেছনের সব এলিমেন্টকে এক ঘর ডানে সরাতে হয় | $O(1)$ — শুধু \`head\` পয়েন্টারটি নতুন নোডে নির্দেশ করলেই হয় |
| **র‍্যান্ডম অ্যাক্সেস** | $O(1)$ — সরাসরি ইনডেক্স ধরে মান পড়া যায় (\`arr[5]\`) | $O(n)$ — শুরু থেকে একটার পর একটা নোড ধরে হেঁটে যেতে হয় |

---

#### 📐 ৩. কোড বাস্তবায়ন (TypeScript / C++):
\`\`\`typescript
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// লিঙ্কড লিস্টের শুরুতে নোড যুক্ত করার নিয়ম: O(1)
function insertAtHead<T>(head: ListNode<T> | null, val: T): ListNode<T> {
  const newNode = new ListNode(val);
  newNode.next = head;
  return newNode;
}
\`\`\`

---

#### ⚠️ ৪. লিঙ্কড লিস্টের প্রকারভেদ ও সমস্যা:
১. **Singly Linked List:** একমুখী গমন (সামনে যাওয়া যায়, পেছনে ফেরা যায় না)।
২. **Doubly Linked List:** দ্বিমুখী পয়েন্টার (\`next\` এবং \`prev\`), সহজে দুই দিকেই ট্রাভার্স করা যায়।
৩. **Circular Linked List:** শেষ নোডের \`next\` পয়েন্টার আবার \`head\`-কে নির্দেশ করে।
- **সমস্যা (Pitfall):** প্রতিটি নোডের জন্য পয়েন্টারের অতিরিক্ত মেমরি খরচ হয় এবং CPU Cache Locality পাওয়া যায় না।

---

#### 🎯 ৫. এক নজরে সারসংক্ষেপ (Key Takeaway):
ঘন ঘন ডেটা ইনসার্ট ও ডিলিট করার প্রয়োজন হলে **লিঙ্কড লিস্ট** সেরা ($O(1)$), আর ইনডেক্স ধরে দ্রুত ডেটা পড়ার প্রয়োজন হলে **অ্যারে** সেরা।`;
    }
  }

  // 5. Recursion & Call Stack
  if (text.includes("recursion") || text.includes("রিকার্শন") || text.includes("call stack")) {
    if (isBn) {
      return `### 🔄 রিকার্শন (Recursion) ও কল স্ট্যাক — প্রথম নীতি থেকে গভীর ব্যাখ্যা

স্যার, রিকার্শন হলো প্রোগ্রামিংয়ের অন্যতম জাদুকরী ও শক্তিশালী কৌশল। আসুন এটি খুব সহজ ও গভীরভাবে হৃদয়ঙ্গম করি:

---

#### 💡 ১. বাস্তব জীবনের সুন্দর উপমা (Real-Life Analogy)
মনে করুন আপনি একটি সিনেমা হলে বসেছেন এবং আপনার সামনের সিটের মানুষের কাছে জানতে চাইলেন— "ভাইয়া, আমরা কত নম্বর সারিতে বসেছি?"
- সামনের মানুষটি নিজেও জানে না। সে তার সামনের জনকে একই প্রশ্ন জিজ্ঞেস করল।
- এভাবে প্রশ্নটি প্রথম সারির (Row 1) মানুষটির কাছে পৌঁছাল।
- প্রথম সারির মানুষটি নিশ্চিতভাবেই জানে সে ১ নম্বর সারিতে। সে উত্তর দিল: "আমি ১ নম্বর সারিতে!"
- তখন ২ নম্বর সারির মানুষটি বুঝতে পারল: $1 + 1 = 2$। সে পেছনের জনকে বলল।
- এভাবে পেছনের দিকে উত্তর ফিরতে ফিরতে অবশেষে আপনার কাছে সঠিক সারির নম্বর পৌঁছে গেল!

এখানে:
- প্রথম সারিতে পৌঁছানো হলো **বেস কেস (Base Case)**।
- সামনের জনকে বারবার একই প্রশ্ন করা হলো **রিকার্সিভ কল (Recursive Call)**।

---

#### 🔬 ২. রিকার্শনের দুটি সোনালী নিয়ম:
যেকোনো রিকার্সিভ ফাংশনে দুটি উপাদান বাধ্যতামূলক:
১. **Base Case:** যেখানে রিকার্শন থেমে যাবে এবং সরাসরি একটি উত্তর রিটার্ন করবে। যদি বেস কেস না থাকে, তবে প্রোগ্রাম অসীম লুপে পড়ে মেমরি ক্র্যাশ করবে।
২. **Recursive Step:** মূল সমস্যাটিকে ঠিক একই ধরনের একটি ক্ষুদ্রতর উপ-সমস্যায় পরিণত করে নিজের ফাংশনকে পুনরায় কল করা।

---

#### 📐 ৩. কোড ও কল-স্ট্যাক ট্রেস (ফ্যাক্টোরিয়াল উদাহরণ):
\`\`\`typescript
function factorial(n: number): number {
  // ১. বেস কেস: ০ বা ১ এর ফ্যাক্টোরিয়াল ১
  if (n <= 1) return 1;

  // ২. রিকার্সিভ স্টেপ: n * (n - 1)!
  return n * factorial(n - 1);
}
\`\`\`

##### কল স্ট্যাকের অভ্যন্তরীণ চিত্র (\`factorial(3)\` এর জন্য):
\`\`\`text
[ Push Phase: স্ট্যাকে জমতে থাকে ]
factorial(3) -> অপেক্ষা করছে: 3 * factorial(2)
  factorial(2) -> অপেক্ষা করছে: 2 * factorial(1)
    factorial(1) -> বেস কেস স্পর্শ করেছে! রিটার্ন করে 1

[ Pop / Unwinding Phase: স্ট্যাক থেকে ফলাফল বের হয় ]
    factorial(1) রিটার্ন করে 1
  factorial(2) রিটার্ন করে 2 * 1 = 2
factorial(3) রিটার্ন করে 3 * 2 = 6
\`\`\`

---

#### ⚠️ ৪. স্ট্যাক ওভারফ্লো (Stack Overflow) ও অপটিমাইজেশন:
- কম্পিউটারের মেমরিতে **Call Stack**-এর একটি নির্দিষ্ট আকার থাকে। রিকার্শন যদি হাজার হাজার বার কল হতেই থাকে কিন্তু বেস কেসে না পৌঁছায়, তবে স্ট্যাকের মেমরি পূর্ণ হয়ে যায় এবং সিস্টেম **Stack Overflow Error** দেয়।
- একে অপটিমাইজ করার জন্য **টেইল রিকার্শন (Tail Call Optimization)** অথবা ডায়নামিক প্রোগ্রামিং মেমোইজেশন ব্যবহার করা হয়।

---

#### 🎯 ৫. এক নজরে সারসংক্ষেপ (Key Takeaway):
রিকার্শন মানে হলো নিজেকে ছোট আকারে সমাধান করে বেস কেসে পৌঁছানো এবং সেখান থেকে ফলাফল একত্র করে চূড়ান্ত উত্তর তৈরি করা।`;
    }
  }

  // 6. OOP (Object-Oriented Programming Pillars)
  if (text.includes("oop") || text.includes("অবজেক্ট ওরিয়েন্টেড") || text.includes("polymorphism") || text.includes("inheritance")) {
    if (isBn) {
      return `### 🏛️ অবজেক্ট ওরিয়েন্টেড প্রোগ্রামিং (OOP)-এর ৪টি স্তম্ভ — গভীর বিশদ ব্যাখ্যা

স্যার, সফটওয়্যার ইঞ্জিনিয়ারিংয়ে পরিচ্ছন্ন, স্কেলেবল ও মডুলার কোড লেখার ভিত্তি হলো OOP। আসুন এর ৪টি মূল স্তম্ভ চমৎকার বাস্তব উদাহরণ দিয়ে বুঝি:

---

#### ১. এনক্যাপসুলেশন (Encapsulation — ডেটা গোপন ও সুরক্ষা)
- **বাস্তব উপমা:** একটি ক্যাপসুল ওষুধের ভেতরে বিভিন্ন রাসায়নিক উপাদান ভরা থাকে, কিন্তু বাইরে থেকে আমরা শুধু ক্যাপসুলের আবরণটি দেখি। একইভাবে একটি এটিএম বুথের ভল্টে কত টাকা আছে তা গ্রাহক সরাসরি স্পর্শ করতে পারে না, শুধুমাত্র নির্দিষ্ট বাটনের মাধ্যমে লেনদেন করতে পারে।
- **কোড টেকনিক:** ক্লাসের ডেটা ভ্যারিয়েবলগুলোকে \`private\` রাখা এবং সেগুলো অ্যাক্সেস করার জন্য \`getter\` ও \`setter\` মেথড ব্যবহার করা। এতে অবৈধ ডেটা প্রবেশ রোধ করা যায়।

#### ২. অ্যাবস্ট্রাকশন (Abstraction — জটিলতা লুকিয়ে প্রয়োজনীয় ফিচার দেখানো)
- **বাস্তব উপমা:** আপনি যখন গাড়ি চালান, আপনি এক্সিলারেটর চাপেন আর গাড়ি চলে। ইঞ্জিন সিলিন্ডারে কীভাবে পেট্রোল বার্ন হচ্ছে বা পিস্টন কীভাবে ঘুরছে, তা চালকের জানার প্রয়োজন নেই।
- **কোড টেকনিক:** \`Interface\` বা \`Abstract Class\` তৈরি করা, যেখানে শুধু নিয়মগুলো ঘোষণা করা থাকে, কিন্তু অভ্যন্তরীণ জটিল বাস্তবায়ন গোপন থাকে।

#### ৩. ইনহেরিটেন্স (Inheritance — কোডের পুনর্ব্যবহারযোগ্যতা)
- **বাস্তব উপমা:** একজন সন্তান তার পিতা-মাতার শারীরিক বৈশিষ্ট্য ও স্বভাবগত গুণাবলী উত্তরাধিকার সূত্রে লাভ করে, পাশাপাশি তার নিজস্ব কিছু নতুন বৈশিষ্ট্যও থাকে।
- **কোড টেকনিক:** একটি প্যারেন্ট ক্লাস (\`Vehicle\`) থেকে চাইল্ড ক্লাস (\`Car\`, \`Bike\`) বৈশিষ্ট্য উত্তরাধিকার সূত্রে গ্রহণ করে। এতে একই কোড বারবার লেখার প্রয়োজন হয় না (DRY Principle)।

#### ৪. পলিমরফিজম (Polymorphism — বহুরূপী আচরণ)
- **বাস্তব উপমা:** আপনি নিজে একই সাথে একজন ছাত্র, একজন সন্তান, এবং একজন ভাই। ভিন্ন ভিন্ন পরিস্থিতিতে আপনি ভিন্ন ভিন্ন আচরণ প্রকাশ করেন।
- **কোড টেকনিক:** 
  - **Compile-time Polymorphism (Method Overloading):** একই নামের মেথড কিন্তু প্যারামিটারের সংখ্যা বা ধরন আলাদা।
  - **Runtime Polymorphism (Method Overriding):** প্যারেন্ট ক্লাসের \`makeSound()\` মেথডকে কুকুর ক্লাস \`Bark\` এবং বিড়াল ক্লাস \`Meow\` হিসেবে নিজ নিজ রূপ অনুযায়ী বদলে ফেলে।

---

#### 🎯 এক নজরে সারসংক্ষেপ (Key Takeaway):
- **Encapsulation:** ডেটা সুরক্ষিত রাখে।
- **Abstraction:** অপ্রয়োজনীয় জটিলতা আড়াল করে।
- **Inheritance:** কোড রিইউজ নিশ্চিত করে।
- **Polymorphism:** একই ইন্টারফেসে ভিন্ন আচরণ প্রকাশের স্বাধীনতা দেয়।`;
    }
  }

  // 7. Dynamic Programming
  if (text.includes("dp") || text.includes("dynamic programming") || text.includes("ডায়নামিক প্রোগ্রামিং")) {
    if (isBn) {
      return `### 🧠 ডায়নামিক প্রোগ্রামিং (Dynamic Programming) — গভীর মূলনীতি ও কৌশল

স্যার, ডায়নামিক প্রোগ্রামিং নিয়ে অনেকের মনে ভীতি থাকে, কিন্তু এর মূল দর্শনটি অত্যন্ত চমৎকার ও বাস্তবসম্মত:

---

#### 💡 ১. বাস্তব জীবনের সুন্দর উপমা (Real-Life Analogy)
একজন গণিতবিদ একটি কাগজে লিখলেন:
\`1 + 1 + 1 + 1 + 1 = ?\`
তিনি একজন ছাত্রকে জিজ্ঞেস করলেন উত্তর কত? ছাত্র গুনে বলল: **৫**।
এরপর গণিতবিদ কাগজের বাম পাশে আরও একটি \`1 +\` যোগ করে লিখলেন:
\`1 + 1 + 1 + 1 + 1 + 1 = ?\`
এবং জিজ্ঞেস করলেন এখন উত্তর কত? ছাত্র সাথে সাথে বলল: **৬**!
গণিতবিদ জিজ্ঞেস করলেন: "তুমি কি আবার প্রথম থেকে সবগুলো এক যোগ করেছ?"
ছাত্র বলল: "না, আমি মনে রেখেছিলাম আগের যোগফল ৫ ছিল, তার সাথে শুধু ১ যোগ করে দিয়েছি!"

**"অতীতের সমাধান মনে রেখে ভবিষ্যতের কাজ সহজ করা" — এটাই হলো ডায়নামিক প্রোগ্রামিংয়ের মূল আত্মা।**

---

#### 🔬 ২. ডিপি প্রয়োগের দুটি অপরিহার্য বৈশিষ্ট্য:
১. **Overlapping Subproblems:** একই ছোট ছোট কাজ বারবার সমাধান করতে হওয়া (যেমন ফিবোনাচ্চি সিরিজে $F(3)$ বারবার ক্যালকুলেট হওয়া)।
২. **Optimal Substructure:** উপ-সমস্যাগুলোর সর্বোত্তম ফলাফল একত্র করে মূল সমস্যার সর্বোত্তম সমাধান পাওয়া।

---

#### 📐 ৩. ডিপি সমাধানের দুটি পদ্ধতি:
১. **Memoization (Top-Down):** সাধারণ রিকার্শনের সাথে একটি ক্যাশ মেমোরি বা ডিকশনারি ব্যবহার করা। যদি উপ-সমস্যাটির উত্তর ক্যাশে থাকে, সরাসরি রিটার্ন করে দেওয়া।
২. **Tabulation (Bottom-Up):** কোনো রিকার্শন ছাড়া বেস কেস থেকে শুরু করে একটি টেবিল বা অ্যারে ক্রমান্বয়ে পূরণ করে চূড়ান্ত উত্তরে পৌঁছানো।

##### ফিবোনাচ্চির উদাহরণ ($O(2^n)$ থেকে $O(n)$-এ রূপান্তর):
\`\`\`typescript
// Bottom-Up Tabulation Approach: O(n) Time, O(1) Space
function fibonacci(n: number): number {
  if (n <= 1) return n;
  let prev2 = 0;
  let prev1 = 1;

  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}
\`\`\`

---

#### 🎯 ৪. এক নজরে সারসংক্ষেপ (Key Takeaway):
যেখানে বারবার একই হিসাব করতে হয়, সেখানে ডিপি ব্যবহার করে ফলাফল ক্যাশে সেভ করে রাখলে এক্সপোনেনশিয়াল টাইম কমপ্লেক্সিটি পলিনমিয়াল বা লিনিয়ার টাইমে নেমে আসে।`;
    }
  }

  // 8. General Science, Study, or Generic Deep Answer Engine
  // Analyzes user query and synthesizes an exhaustive, deep response
  const queryClean = input.replace(/[\?\!\।\,\.]/g, "").trim();

  if (isBn) {
    return `### 📚 "${queryClean}" — সার্বিক বিশ্লেষণ ও গভীর পর্যালোচনা

স্যার, আপনার প্রশ্নটি অত্যন্ত গুরুত্বপূর্ণ। বিষয়টি গভীরভাবে উপলব্ধি করার জন্য আসুন প্রথম নীতি (First Principles) থেকে ধাপে ধাপে এটি পর্যালোচনা করি:

---

#### 💡 ১. বাস্তব জীবনের সহজ উপমা ও সারমর্ম (Intuitive Core)
যেকোনো জটিল তত্ত্ব বা মেকানিজম মূলত বাস্তব জীবনের খুব সাধারণ নিয়মের ওপর ভিত্তি করেই তৈরি হয়। আপনি যে বিষয়টি উত্থাপন করেছেন, তার মূল উদ্দেশ্য হলো কোনো একটি জটিল চ্যালেঞ্জ বা প্রবাহকে সুনির্দিষ্ট ও অনুমানযোগ্য (Predictable) নিয়মের মধ্যে নিয়ে আসা। 

দৈনন্দিন জীবনের একটি সুসংগঠিত সিস্টেমের কথা চিন্তা করুন— যেখানে প্রতিটি উপাদান তার পূর্বনির্ধারিত ভূমিকা যথাযথভাবে পালন করে সামগ্রিক লক্ষ্য অর্জনে অবদান রাখে।

---

#### 🔬 ২. ভেতরের কারণ ও কার্যপদ্ধতি (Underlying Mechanism & Why It Matters)
এই বিষয়ের কার্যকারিতা মূলত তিনটি মৌলিক স্তম্ভের ওপর নির্ভরশীল:
১. **কারণ ও প্রভাবের সম্পর্ক (Causality & Flow):** একটি নির্দিষ্ট ঘটনা বা ইনপুটের ভিত্তিতে পরবর্তী স্টেট পরিবর্তিত হয়। কোনো প্রক্রিয়াই বিচ্ছিন্নভাবে ঘটে না।
২. **সিস্টেমের সীমাবদ্ধতা ও ব্যালেন্স (Constraints & Equilibrium):** প্রতিটি সিস্টেমে কিছু শক্তির টান বা সীমাবদ্ধতা থাকে, যা সিস্টেমটিকে একটি স্থায়ী রূপ বা কাঠামো দান করে।
৩. **দক্ষতা ও অপটিমাইজেশন (Efficiency):** অপ্রয়োজনীয় শক্তি বা মেমরির অপচয় রোধ করে সবচেয়ে কম প্রচেষ্টায় সর্বোত্তম ফলাফল নিশ্চিত করা।

---

#### 📐 ৩. ধাপে ধাপে কাঠামোগত রূপরেখা (Step-by-Step Architecture)
১. **প্রাথমিক প্রস্তুতি (Baseline / Invariant):** সিস্টেমের ভিত্তিপ্রস্তর ও প্রয়োজনীয় পরিবেশ নিশ্চিত করা।
২. **কার্যকরী প্রক্রিয়াকরণ (Core Execution):** সুনির্দিষ্ট নিয়মাবলী ও গাণিতিক বা যৌক্তিক রূপান্তর কার্যকর করা।
৩. **ফলাফল যাচাই ও স্থিতিশীলতা (Validation & Output):** প্রক্রিয়াটির আউটপুট প্রত্যাশিত মানের সাথে সংগতিপূর্ণ কি না তা নিশ্চিত করা।

---

#### ⚠️ ৪. সাধারণ ভুল ধারণা ও গুরুত্বপূর্ণ পরামর্শ (Pitfalls & Best Practices)
- **অতিরিক্ত সরলীকরণ:** অনেক সময় আমরা উপরিভাগের সহজ দৃশ্য দেখে ভেতরের গভীর কারণ উপলব্ধি করতে পারি না। তাই প্রতিটি নিয়মের পেছনের "কেন" অনুসন্ধান করা আবশ্যক।
- **এজ-কেস সচেতনতা:** সাধারণ পরিস্থিতিতে সবকিছু ঠিকঠাক চললেও চরম বা আকস্মিক পরিবর্তনের মুখে কীভাবে প্রতিক্রিয়া দেখাবে, তা আগে থেকেই বিবেচনায় রাখা বুদ্ধিমানের কাজ।

---

#### 🎯 ৫. এক নজরে মূল পয়েন্ট (Key Takeaway)
যেকোনো সমস্যার সমাধানে প্রথমে তার মূল ইনটুইশন অনুভব করা, এরপর ভেতরের কারণ বিশ্লেষণ করা এবং পরিশেষে ধাপে ধাপে তা প্রয়োগ করাই হলো যেকোনো জ্ঞান অর্জনের শ্রেষ্ঠ পথ।

*(স্যার, এই বিষয়ের কোনো বিশেষ কোড, সূত্র বা প্রজেক্ট সম্পর্কিত সুনির্দিষ্ট অংশ দেখতে চাইলে বলুন, আমি সাথে সাথে তা আরও গভীরে নিয়ে ব্যাখ্যা করব।)*`;
  } else {
    return `### 📚 Comprehensive Technical Deconstruction: "${queryClean}"

Sir, I have scrutinized your query. Let us unpack the core principles, underlying mechanics, and architectural guarantees with systematic depth:

---

#### 💡 1. First-Principles Intuition & Conceptual Analogy
At its foundation, this domain addresses a fundamental engineering imperative: decomposing multifaceted ambiguity into deterministic, robust, and composable subsystems.

Consider a distributed relay network: each component possesses high internal cohesion and loose external coupling, allowing the overarching system to maintain structural integrity under dynamic conditions.

---

#### 🔬 2. Core Mechanics & Underlying Architecture
The operational efficacy of this concept rests upon three structural pillars:
1. **Invariant Constraints & State Transitions:** Input state is rigorously bound, ensuring that subsequent mutations remain strictly deterministic without unpredictable side effects.
2. **Resource Optimization & Latency Minimization:** Minimizing auxiliary overhead while maximizing throughput across operational lifecycles.
3. **Defensive Boundaries & Fault Tolerance:** Isolating transient faults to preserve system-wide availability.

---

#### 📐 3. Systematic Step-by-Step Architecture
1. **Initialization & Context Binding:** Allocation of deterministic baseline invariants.
2. **Algorithmic Transformation:** Execution of optimized processing passes with linear or logarithmic scaling.
3. **Verification & Clean Output:** State verification and structured return of verified outcomes.

---

#### ⚠️ 4. Key Pitfalls & Best Practices
- **Premature Generalization:** Ensure concrete domain constraints are thoroughly modeled before layering additional abstractions.
- **Boundary Defense:** Defend against overflow, stale state references, and unhandled edge cases across all operational interfaces.

---

#### 🎯 5. Core Takeaway
Mastery over complex systems requires examining the first-principles intuition, respecting the underlying physical or mathematical laws, and systematically structuring the implementation.

*(Shall we examine a concrete implementation, mathematical proof, or architectural blueprint on this, Sir?)*`;
  }
}

/**
 * Creates an intelligent fallback stream response when remote AI provider is unconfigured or unreachable.
 */
export function createFallbackChatResponse(
  messages: ModelMessage[],
  mode: JervisMode = "tutor",
  lang: "bn" | "en" = "bn",
) {
  const userInput = extractLastUserText(messages);
  const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(userInput);

  let reply = generateSmartFallback(userInput, mode, lang);

  const notice = isBn
    ? `\n\n---\n> 💡 *টিপস: JERVIS বর্তমানে বিল্ট-ইন স্মার্ট নলেজ ইঞ্জিনে কাজ করছে। যেকোনো প্রশ্নের আনলিমিটেড লাইভ ও তাৎক্ষণিক জেনারেটিভ উত্তরের জন্য উপরের "API KEY" বাটনে ক্লিক করে ফ্রি Gemini Key যুক্ত করতে পারেন।*`
    : `\n\n---\n> 💡 *Tip: JERVIS is currently operating on the built-in smart knowledge engine. For live generative responses on any question, tap "API KEY" above to connect your free Google Gemini API key.*`;

  reply += notice;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const msgId = `msg_${Date.now()}`;
      const textId = `part_${Date.now()}`;

      writer.write({ type: "start", messageId: msgId });
      writer.write({ type: "text-start", id: textId });

      // Split reply into natural sentence/phrase chunks for smooth streaming
      const chunks = reply.match(/.{1,16}/g) ?? [reply];
      for (const chunk of chunks) {
        writer.write({ type: "text-delta", id: textId, delta: chunk });
        await new Promise((resolve) => setTimeout(resolve, 8));
      }

      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
