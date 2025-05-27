import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });
  const response = await ai.models.generateContent({
    model: "gemini-1.5-pro-latest",
    contents: prompt,
  });
  return NextResponse.json(response);
}
