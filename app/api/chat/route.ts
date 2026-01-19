import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic, level, time } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Ты Archi. Создай план обучения. Учитывай уровень: ${level} и время: ${time} мин/день. Ответ строго JSON: {"courseTitle": "...", "levels": ["...", "..."]}`
          },
          { role: "user", content: `Тема: ${topic}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (e) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}