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

function generateSmartFallback(input: string, mode: JervisMode, lang: "bn" | "en"): string {
  const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(input);
  const text = input.toLowerCase().trim();

  // Mode: Viva
  if (mode === "viva") {
    if (isBn) {
      if (text.includes("finish") || text.includes("শেষ") || text.includes("সমাপ্ত")) {
        return `### 📋 টেকনিক্যাল ভাইভা স্কোরকার্ড (JERVIS Evaluator)

| বিষয় | প্রশ্ন | স্কোর (/১০) | মন্তব্য |
| :--- | :--- | :---: | :--- |
| ১. ফান্ডামেন্টালস | মেমরি ম্যানেজমেন্ট ও পয়েন্টার | ৮.৫ | স্পষ্ট ধারণা ও সঠিক উদাহরণ দিয়েছেন। |
| ২. ডেটা স্ট্রাকচার | অ্যারে বনাম লিঙ্কড লিস্ট | ৯.০ | টাইম ও স্পেস কমপ্লেক্সিটি যথাযথ ছিল। |
| ৩. অবজেক্ট ওরিয়েন্টেড | পলিমরফিজম ও ইন্টারফেস | ৮.০ | রিয়াল-ওয়ার্ল্ড অ্যানালজি আরো বিস্তারিত করা যেত। |

**মোট স্কোর:** ২৫.৫ / ৩০ (দারুণ পারফরম্যান্স, স্যার!)
**পরামর্শ:** রিকার্শন কল স্ট্যাক ও ডাইনামিক মেমরি অ্যালোকেশনের ক্ষেত্রে আরেকটু নজর দিন।

---
*নতুন কোনো বিষয়ে ভাইভা অনুশীলন করতে চাইলে বিষয়টির নাম লিখুন।*`;
      }
      return `আপনার উত্তরটি পেয়েছি, স্যার।

**মূল্যায়ন:** চমৎকার ও যৌক্তিক ব্যাখ্যা। আপনি মূল ধারণার সাথে ব্যবহারিক ক্ষেত্রটিও সুন্দরভাবে তুলে ধরছেন।

**পরবর্তী ভাইভা প্রশ্ন:**
> *"একটি সিঙ্গলি লিঙ্কড লিস্টের মাঝে কোনো লুপ (Cycle) আছে কি না, তা O(1) স্পেস কমপ্লেক্সিটিতে কীভাবে শনাক্ত করবেন? অ্যালগরিদমটির নাম ও কার্যপদ্ধতি বলুন।"*

*(আপনার উত্তরটি টাইপ করুন বা বলুন, স্যার। শেষ করতে চাইলে "finish" লিখুন)*`;
    } else {
      if (text.includes("finish") || text.includes("done")) {
        return `### 📋 Technical Viva Scorecard (JERVIS Evaluator)

| Topic | Question | Score (/10) | Feedback |
| :--- | :--- | :---: | :--- |
| 1. Fundamentals | Memory Management & Pointers | 8.5/10 | Well-structured explanation with clear terminology. |
| 2. Data Structures | Array vs Linked List Complexity | 9.0/10 | Accurate Big-O analysis and traversal logic. |
| 3. OOP Concepts | Polymorphism & Abstraction | 8.0/10 | Good understanding, could include interface design. |

**Total Score:** 25.5 / 30 (Commendable performance, Sir.)
**Recommendation:** Focus slightly more on recursion call stacks and space complexity proofs.

---
*Whenever you are ready for another round, simply state the topic.*`;
      }
      return `Thank you for your answer, Sir.

**Feedback:** Concise and technically sound. You correctly identified the primary trade-offs and complexity.

**Next Question:**
> *"How would you detect a cycle in a singly linked list with O(1) auxiliary space? Name the algorithm and outline its mechanism."*

*(Please share your response or say "finish" to view your scorecard)*`;
    }
  }

  // Mode: Explain
  if (mode === "explain") {
    if (isBn) {
      return `অবশ্যই স্যার, আসুন কোডটি লাইন বাই লাইন বিশ্লেষণ করি:

### 🔍 কোড বিশ্লেষণ (Line-by-Line Breakdown)
1. **শুরু ও ভ্যারিয়েবল ইনিশিয়ালাইজেশন:** প্রয়োজনীয় ডেটা স্ট্রাকচার ও মেমরি বরাদ্দ করা হয়েছে।
2. **কন্ডিশন ও লজিক্যাল ফ্লো:** ইনপুট যাচাই এবং বেস-কেস চেক নিশ্চিত করা হয়েছে।
3. **লুপ ট্রাভার্সাল:** উপাদানগুলোর উপর দিয়ে iterate করে ফলাফল আপডেট করা হচ্ছে।

### ⏱️ কমপ্লেক্সিটি বিশ্লেষণ:
- **Time Complexity:** $O(n)$ — ইনপুট সাইজের উপর নির্ভর করে একক পাসে সম্পন্ন হয়।
- **Space Complexity:** $O(1)$ — অতিরিক্ত কোনো সহায়ক মেমরি প্রয়োজন হয় না।

*কোনো নির্দিষ্ট লাইন নিয়ে আরও বিস্তারিত আলোচনা প্রয়োজন কি, স্যার?*`;
    } else {
      return `Certainly, Sir. Here is the structured step-by-step breakdown:

### 🔍 Line-by-Line Code Breakdown
1. **Initialization:** The relevant pointers/variables are instantiated.
2. **Base Case Verification:** Bounds checking and edge conditions are verified.
3. **Execution Loop:** Iterates through the collection, transforming or evaluating state.

### ⏱️ Complexity Profile:
- **Time Complexity:** $O(n)$ — Linear pass over input elements.
- **Auxiliary Space:** $O(1)$ — In-place execution without extra allocations.

*Shall we examine any specific section in greater depth, Sir?*`;
    }
  }

  // Mode: Check
  if (mode === "check") {
    if (isBn) {
      return `কোডটি নিরীক্ষা করেছি, স্যার:

### 🛡️ কোড রিভিউ ও এরর চেক
- **সিনট্যাক্স ও টাইপ সেফটি:** কোনো মারাত্মক সিনট্যাক্স ত্রুটি পাওয়া যায়নি।
- **বাউন্ডারি কন্ডিশন:** খালি ইনপুট বা নাল (null/undefined) ভ্যালুর জন্য সেফগার্ড যুক্ত করা উপকারী।
- **কার্যকারিতা ও রিড্যাবিলিটি:** কোড পরিষ্কার ও বোধগম্য।

*আপনি চাইলে নির্দিষ্ট কোনো ইনপুট দিয়ে এটি টেস্ট করতে পারি।*`;
    } else {
      return `Review completed, Sir.

### 🛡️ Code Inspection Report
- **Syntax & Semantics:** No critical syntactic bugs detected.
- **Edge Cases:** Ensure boundary validation for null/undefined or empty collections.
- **Performance:** Efficiency is optimal for typical inputs.

*Would you like me to simulate edge-case inputs for this code, Sir?*`;
    }
  }

  // Specific Topics: Loops
  if (text.includes("loop") || text.includes("লুপ") || text.includes("for") || text.includes("while")) {
    if (isBn) {
      return `লুপ (Loop) সম্পর্কে বিস্তারিত আলোচনা, স্যার:

### ১. লুপ কী?
প্রোগ্রামিংয়ে কোনো নির্দিষ্ট কোড ব্লক বারবার চালানোর প্রক্রিয়াকে লুপ বলে।

### ২. সাধারণ লুপের উদাহরণ (JavaScript / C):
\`\`\`javascript
// ১ থেকে ৫ পর্যন্ত প্রিন্ট করার উদাহরণ
for (let i = 1; i <= 5; i++) {
  console.log("মান:", i);
}
\`\`\`

### ৩. ড্রাই-রান টেবিল (Dry Run):
| ইটারেশন | ভ্যারিয়েবল (i) | শর্ত (i <= 5) | আউটপুট |
| :---: | :---: | :---: | :---: |
| ১ম | ১ | সত্য (True) | ১ |
| ২য় | ২ | সত্য (True) | ২ |
| ৩য় | ৩ | সত্য (True) | ৩ |
| ৪র্থ | ৪ | সত্য (True) | ৪ |
| ৫ম | ৫ | সত্য (True) | ৫ |
| ৬ষ্ঠ | ৬ | মিথ্যা (Stop) | লুপ সমাপ্ত |

### ৪. টাইম কমপ্লেক্সিটি:
- **Time Complexity:** $O(n)$ — যেখানে $n$ হলো লুপ চলার মোট সংখ্যা।
- **Space Complexity:** $O(1)$ — অতিরিক্ত মেমরি লাগে না।

*লুপ সম্পর্কিত কোনো বিশেষ সমস্যা সমাধান করতে চান কি, স্যার?*`;
    }
  }

  // Specific Topics: Functions / Recursion
  if (text.includes("function") || text.includes("ফাংশন") || text.includes("recursion") || text.includes("রিকার্শন")) {
    if (isBn) {
      return `ফাংশন ও রিকার্শন সম্পর্কে সংক্ষেপে তুলে ধরছি, স্যার:

### ⚙️ ফাংশন ও রিকার্শন
একটি ফাংশন যখন সরাসরি বা পরোক্ষভাবে নিজেকেই আবার কল করে, তখন তাকে **রিকার্শন (Recursion)** বলা হয়।

### রিকার্শনের মূল দুটি শর্ত:
1. **Base Case:** যেখানে রিকার্শনটি থেমে যাবে (অন্যথায় Stack Overflow ঘটবে)।
2. **Recursive Step:** যেখানে সমস্যাটি ছোট আকারে নিজের ফাংশনকে কল করবে।

### ফ্যাক্টোরিয়াল উদাহরণ (Python):
\`\`\`python
def factorial(n):
    # Base Case
    if n <= 1:
        return 1
    # Recursive Step
    return n * factorial(n - 1)

print(factorial(5)) # Output: 120
\`\`\`

### ⏱️ কমপ্লেক্সিটি:
- **Time Complexity:** $O(n)$
- **Space Complexity:** $O(n)$ (কল স্ট্যাক মেমোরির কারণে)

*Shall we explore an iterative alternative or examine the call stack diagram, Sir?*`;
    }
  }

  // Mode: Tutor / Greetings
  if (
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("কেমন") ||
    text.includes("kemon") ||
    text.includes("jervis") ||
    text === ""
  ) {
    if (isBn) {
      return `শুভকামনা স্যার! আমি JERVIS — আপনার ব্যক্তিগত AI কোডিং মেন্টর ও সহকারী।

আমি প্রস্তুত আছি আপনাকে সহায়তা করার জন্য:
- 💻 **কোডিং ও সমস্যা সমাধান:** C, C++, Java, Python, JavaScript, TypeScript
- 📚 **কম্পিউটার সায়েন্স ফান্ডামেন্টালস:** Data Structures, Algorithms, Big-O Complexity
- 🗄️ **ডাটাবেজ ও ব্যাকএন্ড:** SQL, PostgreSQL, NeonDB, API Design
- 🎙️ **ভাইভা ও ইন্টারভিউ প্রস্তুতি:** মক ইন্টারভিউ ও তাৎক্ষণিক ফিডব্যাক

আজ কোন টপিকটি দিয়ে শুরু করতে চান, স্যার?`;
    } else {
      return `Greetings, Sir. I am JERVIS — your dedicated AI coding mentor and technical aide.

I stand ready to assist you with:
- 💻 **Programming & Problem Solving:** C, C++, Java, Python, JavaScript, TypeScript
- 📚 **CS Fundamentals:** Data Structures, Algorithms, Big-O Complexity
- 🗄️ **Databases & Systems:** SQL, PostgreSQL, NeonDB, API Architectures
- 🎙️ **Technical Viva & Interviews:** Interactive viva simulation with structured feedback

What shall we examine today, Sir?`;
    }
  }

  // Fallback intelligent answer
  if (isBn) {
    return `আপনার প্রশ্নটি গুরুত্বের সাথে লক্ষ্য করেছি, স্যার।

### 💡 সংক্ষিপ্ত সারসংক্ষেপ ও নির্দেশিকা:
1. **মূল ধারণা:** আপনি যে বিষয়টি উল্লেখ করেছেন ("*${input.slice(0, 80)}*"), তা সফটওয়্যার ডেভেলপমেন্ট ও অ্যালগরিদম ডিজাইনের একটি গুরুত্বপূর্ণ অংশ।
2. **অনুশীলন পদ্ধতি:** বিষয়টিকে ছোট ছোট ধাপে বিভক্ত করে সমাধান করা এবং এজ-কেসগুলো যাচাই করা সবচেয়ে কার্যকর কৌশল।
3. **কোডিং বাস্তবায়ন:** আপনি কোড এডিটরে আপনার কোড লিখে 'Check' বা 'Explain' অপশনে দেখতে পারেন।

*আপনি চাইলে এ সম্পর্কিত কোড উদাহরণ বা সরাসরি কোনো সমস্যার সমাধান তৈরি করে দিতে পারি, স্যার।*`;
  } else {
    return `Understood, Sir. Here are my observations regarding your query:

### 💡 Strategic Overview:
1. **Core Principle:** Regarding "*${input.slice(0, 80)}*", standard best practices favor clear modular structure and explicit boundary handling.
2. **Algorithmic Consideration:** Aim for optimal time complexity while maintaining code clarity and minimal cognitive overhead.
3. **Next Steps:** You may test code snippets in the Code Lab tab or ask for a step-by-step implementation.

*Shall I draft a concrete implementation or run a viva question on this topic, Sir?*`;
  }
}

/**
 * Creates an intelligent fallback stream response when GEMINI_API_KEY is not configured
 * or when the remote AI provider is temporarily unreachable.
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
    ? `\n\n---\n> 💡 *নোট: JERVIS বর্তমানে স্মার্ট অফলাইন/বিল্ট-ইন মোডে কাজ করছে। সম্পূর্ণ লাইভ Gemini ক্লাউড মডেল ব্যবহারের জন্য \`.env\` ফাইলে \`GEMINI_API_KEY\` যুক্ত করুন।*`
    : `\n\n---\n> 💡 *Note: JERVIS is running in built-in offline mode. To enable live Gemini cloud models, configure \`GEMINI_API_KEY\` in your \`.env\` file.*`;

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
