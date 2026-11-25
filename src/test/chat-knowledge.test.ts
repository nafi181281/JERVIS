import { describe, expect, it } from "vitest";
import { generateSmartFallback } from "@/lib/ai/fallback";
import { systemFor } from "@/lib/ai/prompts";

describe("JERVIS Human-to-Human Conversational & Knowledge Engine", () => {
  it("includes human-like conversational intelligence and emotional depth in system prompt", () => {
    const prompt = systemFor("tutor");
    expect(prompt.toLowerCase()).toContain("human-like conversational partner");
    expect(prompt).toContain("Casual & Friendly Chats");
    expect(prompt).toContain("Explaining Concepts & Deep Learning");
  });

  it("responds naturally and warmly to greetings like a real friend", () => {
    const res = generateSmartFallback("kemon acho", "tutor", "bn");
    expect(res).toContain("নাফি");
    expect(res).toContain("ভালো আছি");
    expect(res).not.toContain("First Principles");
    expect(res).not.toContain("Time Complexity");
  });

  it("provides empathetic emotional support when user feels down or stressed", () => {
    const res = generateSmartFallback("mon kharap valo lagche na", "tutor", "bn");
    expect(res).toContain("মন খারাপ কেন");
    expect(res).toContain("বন্ধু");
    expect(res).toContain("গভীর শ্বাস নাও");
  });

  it("acknowledges genuine human friendship and loyalty", () => {
    const res = generateSmartFallback("tumi ki amar bondhu?", "tutor", "bn");
    expect(res).toContain("বন্ধু");
    expect(res).toContain("নাফি");
  });

  it("explains planetary motion and gravity deeply in Bengali with analogies", () => {
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

  it("provides a structured 5-part deep breakdown for arbitrary custom conceptual queries", () => {
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
