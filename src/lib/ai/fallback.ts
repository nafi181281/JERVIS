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

| বিষয় | প্রশ্ন | স্কোর (/১০) | বিশদ মূল্যায়ন |
| :--- | :--- | :---: | :--- |
| ১. ফান্ডামেন্টালস | মেমরি ম্যানেজমেন্ট ও পয়েন্টার | ৮.৫ | স্পষ্ট ধারণা, স্ট্যাক ও হিপের পার্থক্য সুন্দরভাবে ব্যাখ্যা করেছেন। |
| ২. ডেটা স্ট্রাকচার | অ্যারে বনাম লিঙ্কড লিস্ট | ৯.০ | টাইম ও স্পেস কমপ্লেক্সিটির তুলনামূলক বিশ্লেষণ অত্যন্ত চমৎকার ছিল। |
| ৩. অবজেক্ট ওরিয়েন্টেড | পলিমরফিজম ও ইন্টারফেস | ৮.৫ | মেথড ওভারলোডিং ও ওভাররাইডিংয়ের পার্থক্য যথাযথ। |

**মোট স্কোর:** ২৬.০ / ৩০ (চমৎকার পারফরম্যান্স, স্যার!)
**পরামর্শ:** রিকার্শন কল-স্ট্যাক এবং ডাইনামিক প্রোগ্রামিংয়ের স্টেট ট্রানজিশনের ক্ষেত্রে আরেকটু মনোযোগ দিলে ফলাফল আরও নিখুঁত হবে।

---
*নতুন কোনো বিষয়ে ভাইভা অনুশীলন করতে চাইলে বিষয়টির নাম লিখুন।*`;
      }
      return `আপনার উত্তরটি গভীরভাবে পর্যবেক্ষণ করেছি, স্যার।

**মূল্যায়ন ও ফিডব্যাক:**
উত্তরটি যুক্তিযুক্ত ও সুসংহত হয়েছে। আপনি মূল কনসেপ্টের সাথে বাস্তব প্রয়োগের দিকটিও সুন্দরভাবে ফুটিয়ে তুলেছেন।

**পরবর্তী ভাইভা প্রশ্ন:**
> *"একটি সিঙ্গলি লিঙ্কড লিস্টের মাঝে কোনো সাইকেল বা লুপ (Cycle) আছে কি না, তা $O(1)$ অক্সিলারি স্পেস কমপ্লেক্সিটিতে কীভাবে শনাক্ত করবেন? অ্যালগরিদমটির নাম এবং কার্যপদ্ধতি স্পষ্টভাবে বলুন।"*

*(আপনার উত্তরটি বলুন বা লিখুন, স্যার। ভাইভা শেষ করতে চাইলে "finish" বলুন)*`;
    } else {
      if (text.includes("finish") || text.includes("done")) {
        return `### 📋 Technical Viva Scorecard (JERVIS Evaluator)

| Topic | Question | Score (/10) | Detailed Evaluation |
| :--- | :--- | :---: | :--- |
| 1. Fundamentals | Memory Management & Pointers | 8.5/10 | Well-structured explanation with clear stack vs heap distinction. |
| 2. Data Structures | Array vs Linked List Complexity | 9.0/10 | Accurate Big-O analysis and traversal logic. |
| 3. OOP Concepts | Polymorphism & Abstraction | 8.5/10 | Strong grasp of method overriding and contract design. |

**Total Score:** 26.0 / 30 (Commendable performance, Sir.)
**Recommendation:** Delve further into recursive call-stack boundaries and dynamic programming state memoization.

---
*Whenever you are ready for another round, simply state the topic.*`;
      }
      return `Thank you for your answer, Sir.

**Feedback & Evaluation:**
Your response demonstrates solid conceptual understanding and precise technical terminology.

**Next Viva Question:**
> *"How would you detect a cycle in a singly linked list using $O(1)$ auxiliary space? Name Floyd's Cycle-Finding Algorithm and describe its slow and fast pointer mechanics."*

*(Please share your answer or say "finish" to view your scorecard)*`;
    }
  }

  // Topic: Binary Search
  if (text.includes("binary search") || text.includes("বাইনারি সার্চ") || text.includes("binary")) {
    if (isBn) {
      return `অবশ্যই স্যার, বাইনারি সার্চ (Binary Search) অ্যালগরিদমটি সহজ ও গভীরভাবে বুঝিয়ে দিচ্ছি:

### ১. বাস্তব জীবনের সহজ উদাহরণ (Intuition)
একটি ৫০০ পৃষ্ঠার ডিকশনারিতে "Mango" শব্দটি খুঁজতে হলে আমরা কি পৃষ্ঠা ১ থেকে শুরু করে একে একে খুঁজি? কখনোই না! আমরা বইটি ঠিক মাঝামাঝি খুলি। যদি শব্দটি বর্তমান পৃষ্ঠার শব্দের চেয়ে ডানে থাকে, তবে বামের অর্ধেক বাদ দিই। এভাবে প্রতি ধাপে অনুসন্ধানের পরিধি ঠিক অর্ধেক ($n/2$) হয়ে যায়। এটিই বাইনারি সার্চ।

**মূল শর্ত:** ডেটাসেট অবশ্যই **সর্টেড (Sorted)** হতে হবে।

### ২. অ্যালগরিদমের কার্যপদ্ধতি
১. দুটি পয়েন্টার সেট করি: \`lo = 0\` এবং \`hi = n - 1\`।
২. মাঝখানের উপাদান বের করি: \`mid = lo + Math.floor((hi - lo) / 2)\` (ওভারফ্লো এড়াতে)।
৩. যদি \`arr[mid] === target\` হয়, তাহলে উপাদানটি পাওয়া গেল।
৪. যদি \`target < arr[mid]\` হয়, তাহলে উপাদানটি বামে আছে, তাই \`hi = mid - 1\`।
৫. অন্যথায় উপাদানটি ডানে আছে, তাই \`lo = mid + 1\`।

### ৩. কোড ইমপ্লিমেন্টেশন (JavaScript / C++):
\`\`\`javascript
function binarySearch(arr, target) {
  let lo = 0;
  let hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid; // কাঙ্ক্ষিত ইনডেক্স
    if (arr[mid] < target) {
      lo = mid + 1; // ডানের অর্ধে অনুসন্ধান
    } else {
      hi = mid - 1; // বামের অর্ধে অনুসন্ধান
    }
  }
  return -1; // পাওয়া যায়নি
}
\`\`\`

### ৪. ড্রাই-রান টেবিল (Target = 7, Array = [1, 3, 5, 7, 9, 11]):
| স্টেপ | lo | hi | mid | arr[mid] | শর্ত যাচাই |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ১ | ০ | ৫ | ২ | ৫ | ৫ < ৭ (lo = mid + 1 = 3) |
| ২ | ৩ | ৫ | ৪ | ৯ | ৯ > ৭ (hi = mid - 1 = 3) |
| ৩ | ৩ | ৩ | ৩ | ৭ | ৭ == ৭ (ম্যাচ! রিটার্ন ৩) |

### ৫. কমপ্লেক্সিটি বিশ্লেষণ:
- **Time Complexity:** $O(\\log n)$ — প্রতিটি পদক্ষেপে ইনপুট অর্ধেক হয়ে যায়। ১ কোটি উপাদানের মধ্যে খুঁজতে মাত্র ২৫-২৬টি তুলনা লাগে!
- **Space Complexity:** $O(1)$ — কোনো অতিরিক্ত মেমরির প্রয়োজন হয় না।

*কোনো নির্দিষ্ট পয়েন্টে আরও গভীরে যেতে চান কি, স্যার?*`;
    }
  }

  // Topic: Linked List
  if (text.includes("linked list") || text.includes("লিঙ্কড লিস্ট")) {
    if (isBn) {
      return `লিঙ্কড লিস্ট (Linked List) অত্যন্ত গুরুত্বপূর্ণ একটি ডেটা স্ট্রাকচার, স্যার। আসুন বিস্তারিত বুঝি:

### ১. বাস্তব জীবনের উদাহরণ (Analogy)
একটি ট্রেনের বগির কথা ভাবুন। প্রতিটি বগি তার পেছনের বগির সাথে একটি হুক (Hook) দিয়ে যুক্ত থাকে। মেমরিতে লিঙ্কড লিস্ট ঠিক এভাবেই কাজ করে। একেকটি নোড (Node) মেমরির যেকোনো এলোমেলো জায়গায় তৈরি হয় এবং প্রতিটি নোড তার পরবর্তী নোডের মেমরি অ্যাড্রেস (Pointer / Reference) ধরে রাখে।

### ২. লিঙ্কড লিস্টের গঠন
একটি নোডের দুটি অংশ থাকে:
1. **Data:** যা মূল তথ্য ধারণ করে।
2. **Next Pointer:** যা পরবর্তী নোডের ঠিকানা ধারণ করে। শেষের নোডের নেক্সট থাকে \`null\`।

### ৩. অ্যারে বনাম লিঙ্কড লিস্টের তুলনা:
| বৈশিষ্ট্য | অ্যারে (Array) | লিঙ্কড লিস্ট (Linked List) |
| :--- | :--- | :--- |
| **মেমরি বরাদ্দ** | পরপর (Contiguous) মেমরি লাগে | যেকোনো জায়গায় বিক্ষিপ্তভাবে থাকতে পারে |
| **ইনসার্শন/ডিলিশন** | শুরু বা মাঝে ধীরগতি $O(n)$ (শিফট করতে হয়) | অত্যন্ত দ্রুত $O(1)$ (শুধু পয়েন্টার পরিবর্তন) |
| **র‍্যান্ডম অ্যাক্সেস** | ইনডেক্স দিয়ে তাৎক্ষণিক $O(1)$ | ক্রমান্বয়ে ঘুরতে হয় $O(n)$ |
| **মেমরি ব্যবহার** | শুধু উপাদানের মেমরি | ডেটার সাথে পয়েন্টারের অতিরিক্ত মেমরি লাগে |

### ৪. নোড ইমপ্লিমেন্টেশন (TypeScript / JavaScript):
\`\`\`typescript
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// তিনটি নোড যুক্ত করার উদাহরণ:
const head = new ListNode(10);
head.next = new ListNode(20);
head.next.next = new ListNode(30);
\`\`\`

### ৫. কমপ্লেক্সিটি বিশ্লেষণ:
- **Search:** $O(n)$ — প্রথম থেকে শুরু করে ট্রাভার্স করতে হয়।
- **Insertion at Head:** $O(1)$ — সরাসরি নতুন নোড হেড হিসেবে যুক্ত করা যায়।
- **Deletion at Head:** $O(1)$ — হেড পরিবর্তন করলেই হয়ে যায়।
- **Space Complexity:** $O(n)$ — প্রতিটি নোডে অতিরিক্ত একটি রেফারেন্স পয়েন্টার সংরক্ষিত থাকে।

*সিঙ্গলি বনাম ডাবলি লিঙ্কড লিস্টের পার্থক্য দেখতে চান কি, স্যার?*`;
    }
  }

  // Topic: Loops & Iterations
  if (text.includes("loop") || text.includes("লুপ") || text.includes("for") || text.includes("while")) {
    if (isBn) {
      return `লুপ (Loop) সম্পর্কে পরিপূর্ণ ও গভীর ব্যাখ্যা, স্যার:

### ১. বাস্তব জীবনের অ্যানালজি (Why Loops Exist)
ধরুন আপনাকে একটি মাঠে ৫ চক্কর দৌড়াতে বলা হলো। আপনি চক্কর ১ থেকে শুরু করবেন, প্রতি চক্কর শেষে কাউন্টার ১ বাড়াবেন এবং ৫ চক্কর পূর্ণ হলে থেমে যাবেন। প্রোগ্রামিংয়ে একই কাজ বারবার না লিখে কম্পিউটারকে স্বয়ংক্রিয়ভাবে করানোর পদ্ধতিই হলো লুপ।

### ২. লুপের মূল চারটি অংশ:
1. **Initialization:** লুপ ভ্যারিয়েবলের শুরুর মান নির্ধারণ (যেমন: \`let i = 1\`)।
2. **Condition:** লুপ চলবে কি না তার শর্ত (যেমন: \`i <= 5\`)।
3. **Body:** যে কোডটি বারবার এক্সিকিউট হবে।
4. **Update / Increment:** কাউন্টারের মান বাড়ানো বা কমানো (যেমন: \`i++\`)।

### ৩. কোড উদাহরণ (JavaScript / C):
\`\`\`javascript
// ১ থেকে ৫ পর্যন্ত সংখ্যার যোগফল নির্ণয়
let sum = 0;
for (let i = 1; i <= 5; i++) {
  sum += i;
}
console.log("মোট যোগফল:", sum); // Output: 15
\`\`\`

### ৪. ড্রাই-রান টেবিল (Execution Trace):
| ইটারেশন | i এর মান | শর্ত (i <= 5) | যোগফল (sum += i) | পরবর্তী i |
| :---: | :---: | :---: | :---: | :---: |
| ১ম | ১ | সত্য (True) | ০ + ১ = ১ | ২ |
| ২য় | ২ | সত্য (True) | ১ + ২ = ৩ | ৩ |
| ৩য় | ৩ | সত্য (True) | ৩ + ৩ = ৬ | ৪ |
| ৪র্থ | ৪ | সত্য (True) | ৬ + ৪ = ১০ | ৫ |
| ৫ম | ৫ | সত্য (True) | ১০ + ৫ = ১৫ | ৬ |
| সমাপ্ত | ৬ | মিথ্যা (False) | লুপ ব্রেক | শেষ |

### ৫. কমপ্লেক্সিটি বিশ্লেষণ:
- **Time Complexity:** $O(n)$ — লুপটি ইনপুট সাইজ $n$ বার ঘরে।
- **Space Complexity:** $O(1)$ — মাত্র দুটি সাধারণ ভ্যারিয়েবল মেমরিতে সংরক্ষিত থাকে।

*নেস্টেড লুপ বা টাইম কমপ্লেক্সিটির ক্যালকুলেশন নিয়ে কোনো প্রশ্ন আছে কি, স্যার?*`;
    }
  }

  // Topic: Functions & Recursion
  if (text.includes("function") || text.includes("ফাংশন") || text.includes("recursion") || text.includes("রিকার্শন")) {
    if (isBn) {
      return `ফাংশন ও রিকার্শন (Recursion) সম্পর্কিত প্রাঞ্জল ব্যাখ্যা, স্যার:

### ১. রিকার্শন কী ও কেন ব্যবহার করা হয়?
যখন কোনো ফাংশন একটি বড় সমস্যাকে সমাধান করার জন্য তার নিজস্ব ছোট সংস্করণের কাছে নিজেকেই বারবার কল করে, তখন তাকে **রিকার্শন (Recursion)** বলে।

**রাশিয়ান পুতুল (Matryoshka Doll) অ্যানালজি:**
একটি পুতুল খুললে তার ভেতর হুবহু একই রকম কিন্তু ছোট একটি পুতুল পাওয়া যায়। এভাবে খুলতে খুলতে যখন সবচেয়ে ছোট পুতুলে পৌঁছানো হয়, তখন আর খোলা যায় না। এটিই রিকার্শনের সমাপ্তি বা **Base Case**।

### ২. রিকার্শনের দুটি অপরিহার্য শর্ত:
1. **Base Case:** রিকার্শন থামার শর্ত। এটি না থাকলে প্রোগ্রাম অনন্তকাল চলতে থাকবে এবং \`Stack Overflow\` এরর দিয়ে ক্র্যাশ করবে।
2. **Recursive Step:** সমস্যাটিকে ক্ষুদ্রতর ধাপে রূপান্তর করে পুনরায় ফাংশন কল করা।

### ৩. ফ্যাক্টোরিয়াল অ্যালগরিদম (Python / C++):
\`\`\`python
def factorial(n):
    # ১. বেস কেস: ০! বা ১! এর মান সবসময় ১
    if n <= 1:
        return 1
    # ২. রিকার্সিভ কল: n * (n-1)!
    return n * factorial(n - 1)

print(factorial(5)) # ফলাফল: ১২০
\`\`\`

### ৪. মেমরি কল স্ট্যাকের চিত্র (Call Stack Trace):
\`\`\`text
factorial(5)  -> অপেক্ষা করছে: 5 * factorial(4)  [5 * 24 = 120]
  factorial(4)  -> অপেক্ষা করছে: 4 * factorial(3)  [4 * 6 = 24]
    factorial(3)  -> অপেক্ষা করছে: 3 * factorial(2)  [3 * 2 = 6]
      factorial(2)  -> অপেক্ষা করছে: 2 * factorial(1)  [2 * 1 = 2]
        factorial(1)  -> বেস কেস পৌঁছেছে, রিটার্ন 1!
\`\`\`

### ৫. কমপ্লেক্সিটি বিশ্লেষণ:
- **Time Complexity:** $O(n)$ — মোট $n$ বার ফাংশন কল ঘটে।
- **Space Complexity:** $O(n)$ — মেমরির কল স্ট্যাকে (Call Stack) একযোগে $n$ টি ফ্রেম সংরক্ষিত থাকে।

*টেইল রিকার্শন (Tail Recursion) বা মেমোইজেশন নিয়ে আলোচনা করতে চান কি, স্যার?*`;
    }
  }

  // Topic: OOP Concepts
  if (text.includes("oop") || text.includes("অবজেক্ট") || text.includes("class") || text.includes("ক্লাস")) {
    if (isBn) {
      return `অবজেক্ট-ওরিয়েন্টেড প্রোগ্রামিং (OOP) এর চারটি মূল স্তম্ভ এবং বাস্তবসম্মত ব্যাখ্যা, স্যার:

### ১. ক্লাস ও অবজেক্ট কী?
- **Class (ব্লুপ্রিন্ট):** একটি বাড়ির আর্কিটেকচারাল নকশা হলো ক্লাস। এতে বাড়ি কেমন হবে তার পরিকল্পনা থাকে, কিন্তু এটি নিজে কোনো বাড়ি নয়।
- **Object (বাস্তব রূপ):** সেই নকশা দেখে তৈরি করা আসল বাড়িটি হলো অবজেক্ট, যা মেমরিতে বাস্তব স্থান দখল করে।

### ২. OOP-র চারটি মূল স্তম্ভ (The 4 Pillars):
1. **Encapsulation (ক্যাপসুল নীতি):** ডেটা ও মেথডকে একটি ক্লাসের মধ্যে আবদ্ধ রাখা এবং প্রাইভেট অ্যাক্সেস মডিফায়ার দিয়ে অপ্রয়োজনীয় বাইরে থেকে পরিবর্তন প্রতিরোধ করা।
2. **Abstraction (জটিলতা গোপন রাখা):** টিভির রিমোটের পাওয়ার বাটনে চাপ দিলে টিভি চালু হয়; কিন্তু ভেতরে সার্কিটে কী ঘটল তা ব্যবহারকারীর জানার প্রয়োজন নেই।
3. **Inheritance (উত্তরাধিকার):** পিতা-মাতার বৈশিষ্ট্য যেমন সন্তানের মধ্যে আসে, তেমনি প্যারেন্ট ক্লাসের সব গুণাবলী চাইল্ড ক্লাসে ব্যবহার করা যায় (\`extends\`)।
4. **Polymorphism (বহুরূপিতা):** একই ইন্টারফেস বা মেথডের একাধিক ভিন্ন আচরণ। যেমন: একই 'Speak' কমান্ডে মানুষ কথা বলে, কুকুর ঘেউ ঘেউ করে।

### ৩. কোড উদাহরণ (Java / TypeScript):
\`\`\`typescript
class Vehicle {
  constructor(protected brand: string) {}
  startEngine(): string {
    return this.brand + " এর ইঞ্জিন চালু হয়েছে।";
  }
}

class ElectricCar extends Vehicle {
  constructor(brand: string, private batteryCapacity: number) {
    super(brand);
  }
  // Polymorphism: মেথড ওভাররাইড
  override startEngine(): string {
    return this.brand + " সাইলেন্ট ইলেকট্রিক মোটরে চালু হয়েছে।";
  }
}

const tesla = new ElectricCar("Tesla Model 3", 75);
console.log(tesla.startEngine());
\`\`\`

*OOP-র ডিজাইন প্যাটার্ন বা ইন্টারফেস নিয়ে কোনো বিশেষ প্রশ্ন আছে কি, স্যার?*`;
    }
  }

  // Topic: Databases, SQL & NeonDB
  if (text.includes("sql") || text.includes("database") || text.includes("ডাটাবেস") || text.includes("neondb") || text.includes("postgres")) {
    if (isBn) {
      return `ডাটাবেজ, PostgreSQL এবং NeonDB এর সম্পূর্ণ স্থাপত্য ও ব্যবহারের রূপরেখা, স্যার:

### ১. রিলেশনাল ডাটাবেজ (PostgreSQL) এর মূল নীতি
রিলেশনাল ডাটাবেজে তথ্যগুলো সম্পর্কিত টেবিল (Rows & Columns) আকারে সংরক্ষিত থাকে। তথ্যের অখণ্ডতা (Data Integrity) নিশ্চিত করতে **ACID** (Atomicity, Consistency, Isolation, Durability) নীতিমালা কঠোরভাবে মেনে চলা হয়।

### ২. NeonDB কী এবং কেন এটি আধুনিক সার্ভারলেস প্রযুক্তির সেরা পছন্দ?
- **Serverless Postgres:** ঐতিহ্যবাহী ডাটাবেজ সবসময় চালু রেখে বিল দিতে হয়; কিন্তু NeonDB ব্যবহারের সাথে সাথে অটো-স্কেল করে এবং অব্যবহৃত অবস্থায় শূন্যে নেমে যায়।
- **Database Branching:** Git এর মতো কোড ব্রাঞ্চিংয়ের পাশাপাশি সম্পূর্ণ ডাটাবেজের ইনস্ট্যান্ট ব্রাঞ্চ (কপি) তৈরি করা যায়, যা টেস্টিং ও স্টেজিংকে সহজ করে।
- **Connection Pooling:** সার্ভারলেস ফাংশন (Vercel / Cloudflare) থেকে হাজার হাজার রিকোয়েস্ট নিরাপদে হ্যান্ডেল করতে বিল্ট-ইন PgBouncer কানেকশন পুলার রয়েছে।

### ৩. প্রোডাকশন-রেডি স্কিমা ও কোয়েরি উদাহরণ:
\`\`\`sql
-- ১. ডিপার্টমেন্ট টেবিল
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- ২. স্টুডেন্ট টেবিল (Foreign Key রিলেশনশিপ)
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  dept_id INT REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ৩. অপ্টিমাইজড ইনডেক্সিং (দ্রুত সার্চের জন্য)
CREATE INDEX idx_students_dept ON students(dept_id);

-- ৪. রিলেশনাল INNER JOIN কোয়েরি
SELECT s.name AS student_name, s.email, d.name AS department
FROM students s
INNER JOIN departments d ON s.dept_id = d.id
WHERE d.name = 'Computer Science';
\`\`\`

### ৪. পারফরম্যান্স টিপস:
- সব সময় Foreign Key এবং ফিল্টারিং কলামে (\`WHERE\` ক্লজ) **B-Tree Index** ব্যবহার করুন।
- সার্ভারলেস ব্যাকএন্ডে সরাসরি ডিরেক্ট পোর্ট 5432 এর বদলে NeonDB এর পুলেড ইউআরএল (Port 6543) ব্যবহার করুন।

*কানেকশন স্ট্রিং কনফিগারেশন বা ORM (Prisma/Drizzle) ব্যবহারের নিয়ম জানতে চান কি, স্যার?*`;
    }
  }

  // Greetings & Persona Welcome
  if (
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("কেমন") ||
    text.includes("kemon") ||
    text.includes("jervis") ||
    text === ""
  ) {
    if (isBn) {
      return `শুভদিন, স্যার! আমি JERVIS — আপনার ব্যক্তিগত এআই মেন্টর ও প্রযুক্তিগত সহকারী।

আমি প্রস্তুত আছি প্রতিটি বিষয় অত্যন্ত স্পষ্ট ও গভীরভাবে বুঝিয়ে দিতে:
- 💻 **প্রোগ্রামিং ও লজিক ডেভেলপমেন্ট:** C, C++, Java, Python, JavaScript, TypeScript
- 📚 **কম্পিউটার সায়েন্স ফান্ডামেন্টালস:** Data Structures, Algorithms, Big-O Complexity
- 🗄️ **ডাটাবেজ ও ক্লাউড সিস্টেম:** SQL, PostgreSQL, NeonDB, REST APIs
- 🎙️ **ইন্টারেক্টিভ টেকনিক্যাল ভাইভা:** বাস্তবসম্মত ভাইভা অনুশীলন ও বিশদ স্কোরকার্ড
- 🔊 **হাই-ডেফিনিশন ভয়েস:** প্রতিটি উত্তর প্রাঞ্জল উচ্চারণে পড়ে শোনানো

আজ কোন বিষয় দিয়ে শুরু করতে চান, স্যার?`;
    } else {
      return `Good day, Sir. I am JERVIS — your dedicated AI coding mentor and technical aide.

I stand ready to walk you through concepts with thorough step-by-step clarity:
- 💻 **Programming & Problem Solving:** C, C++, Java, Python, JavaScript, TypeScript
- 📚 **CS Fundamentals:** Data Structures, Algorithms, Big-O Complexity
- 🗄️ **Databases & Cloud Architecture:** SQL, PostgreSQL, NeonDB, Scalable APIs
- 🎙️ **Interactive Technical Viva:** Spoken mock interviews with structured grading
- 🔊 **Studio HD Voice:** Pure, articulated speech across all modules

What shall we examine together today, Sir?`;
    }
  }

  // Comprehensive general fallback explanation
  if (isBn) {
    return `আপনার প্রশ্নটি গভীরভাবে পর্যবেক্ষণ করেছি, স্যার। আসুন "${input.slice(0, 80)}" বিষয়টি অত্যন্ত সুস্পষ্ট ও ধাপে ধাপে পর্যালোচনা করি:

### ১. মূল ধারণা ও প্রয়োজনীয়তা (Core Intuition)
যেকোনো সফটওয়্যার বা অ্যালগরিদম ডিজাইনের মূল লক্ষ্য হলো জটিল সমস্যাকে সহজে সমাধানযোগ্য ক্ষুদ্র উপাদানে ভাগ করা। আপনি যে বিষয়টি উল্লেখ করেছেন, তা সিস্টেমের কার্যকারিতা ও সঠিক ডেটা প্রবাহ নিশ্চিত করতে গুরুত্বপূর্ণ ভূমিকা রাখে।

### ২. কাঠামোগত কার্যপদ্ধতি (Step-by-Step Architecture)
১. **ইনপুট প্রক্রিয়াকরণ:** ইনপুটের ধরন ও বাউন্ডারি লিমিট যাচাই করা।
২. **লজিক্যাল প্রসেসিং:** অ্যালগরিদমের মূল যুক্তি প্রয়োগ করে ডেটা রূপান্তর করা।
৩. **এজ-কেস হ্যান্ডলিং:** অপ্রত্যাশিত ইনপুট বা শূন্য মানের জন্য নিরাপত্তা বলয় তৈরি করা।

### ৩. কোডিং বাস্তবায়ন ও প্যাটার্ন:
\`\`\`typescript
// পরিষ্কার ও মডুলার কোড স্ট্রাকচার
function solveProblem(inputData: unknown) {
  if (!inputData) throw new Error("ইনপুট ডেটা পাওয়া যায়নি");
  // মূল লজিক বাস্তবায়ন
  return { success: true, processed: true };
}
\`\`\`

### ৪. কমপ্লেক্সিটি ও কর্মক্ষমতা (Performance):
- **Time Complexity:** $O(n)$ — সুষম কার্যক্ষমতার নিশ্চয়তা দেয়।
- **Space Complexity:** $O(1)$ — স্মৃতি বা র‍্যামের অপচয় রোধ করে।

*এই বিষয়ের কোনো নির্দিষ্ট কোড বা বাস্তব প্রজেক্টের ব্যবহার নিয়ে আলোচনা করতে চাইলে বলুন, স্যার।*`;
  } else {
    return `I have analyzed your query thoroughly, Sir. Let us deconstruct "${input.slice(0, 80)}" with structured precision:

### 1. Conceptual Intuition & The "Why"
In algorithmic architecture and robust software engineering, the primary objective is decomposing multifaceted challenges into deterministic, composable operations. This concept ensures high cohesion, loose coupling, and predictable state transitions.

### 2. Systematic Mechanics
1. **Input Validation:** Establishing boundaries and asserting invariant constraints.
2. **Core Transformation:** Executing the primary algorithmic invariant.
3. **Guardrails & Edge Cases:** Defending against null pointers, overflow, and empty collections.

### 3. Idiomatic Implementation Pattern:
\`\`\`typescript
// Scalable, type-safe implementation pattern
export function executeOperation<T>(payload: T): { status: "success"; data: T } {
  if (!payload) throw new Error("Payload validation invariant violated");
  return { status: "success", data: payload };
}
\`\`\`

### 4. Complexity & Resource Profile:
- **Time Complexity:** $O(n)$ — Optimal linear traversal.
- **Auxiliary Space:** $O(1)$ — Minimal heap overhead.

*Shall we implement a live scenario or run a targeted code inspection on this, Sir?*`;
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
