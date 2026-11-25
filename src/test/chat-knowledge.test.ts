import { describe, expect, it } from "vitest";
import { generateSmartFallback } from "@/lib/ai/fallback";
import { systemFor } from "@/lib/ai/prompts";

describe("JERVIS Knowledge & Deep Explanation Engine", () => {
  it("includes deep explanation mandate and universal knowledge in system prompt", () => {
    const prompt = systemFor("tutor");
    expect(prompt).toContain("Universal Knowledge");
    expect(prompt).toContain("Deep Explanation Mandate");
    expect(prompt).toContain("বাস্তব জীবনের সুন্দর উদাহরণ");
  });

  it("explains planetary motion and gravity deeply in Bengali", () => {
    const res = generateSmartFallback("পৃথিবী কেন সূর্যের চারদিকে ঘোরে? বিস্তারিত বুঝাও", "tutor", "bn");
    expect(res).toContain("পৃথিবী কেন সূর্যের চারদিকে ঘোরে?");
    expect(res).toContain("বাস্তব জীবনের সহজ উপমা");
    expect(res).toContain("মহাকর্ষ");
    expect(res).toContain("আইনস্টাইন");
  });

  it("explains binary search with intuition, step-by-step logic, and Big-O", () => {
    const res = generateSmartFallback("Explain binary search in Bengali", "tutor", "bn");
    expect(res).toContain("বাইনারি সার্চ");
    expect(res).toContain("বাস্তব জীবনের সুন্দর উপমা");
    expect(res).toContain("Time Complexity");
    expect(res).toContain("Space Complexity");
  });

  it("explains recursion with call-stack walkthrough", () => {
    const res = generateSmartFallback("Recursion কীভাবে কাজ করে?", "tutor", "bn");
    expect(res).toContain("রিকার্শন");
    expect(res).toContain("Base Case");
    expect(res).toContain("Call Stack");
  });

  it("provides a structured 5-part deep breakdown for arbitrary custom queries", () => {
    const res = generateSmartFallback("কোয়ান্টাম কম্পিউটিং কী এবং কেন এটি দরকার?", "tutor", "bn");
    expect(res).toContain("বাস্তব জীবনের সহজ উপমা");
    expect(res).toContain("ভেতরের কারণ ও কার্যপদ্ধতি");
    expect(res).toContain("ধাপে ধাপে কাঠামোগত রূপরেখা");
    expect(res).toContain("এক নজরে মূল পয়েন্ট");
  });

  it("generates structured viva scores and feedback", () => {
    const res = generateSmartFallback("finish", "viva", "bn");
    expect(res).toContain("টেকনিক্যাল ভাইভা চূড়ান্ত স্কোরকার্ড");
    expect(res).toContain("মোট স্কোর");
  });
});
