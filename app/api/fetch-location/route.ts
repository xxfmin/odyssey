import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const ai = new OpenAI({ apiKey: process.env.GEMINI_KEY });

export async function POST(req: Request) {
  const { destination } = await req.json();
  const system = `You are a geocoding assistant.`;
  const user = `Parse "${destination}".  
If it’s a real place people can travel to, return exactly:
{"lat": <number>, "lng": <number>}
Otherwise return:
{"error":"invalid"}.`;
  const res = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  try {
    const geo = JSON.parse(res.choices[0].message.content as string);
    return NextResponse.json(geo);
  } catch {
    return NextResponse.json({ error: "parse_failed" }, { status: 500 });
  }
}
