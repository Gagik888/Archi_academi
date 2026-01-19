import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, stepTitle, topic, level } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Ты робот Archi. Если код верный, начни ответ строго с фразы "СИСТЕМА В НОРМЕ". 
            Затем дай краткий и крутой фидбек с эмодзи 🤖.`
          },
          { role: "user", content: `Тема: ${topic}. Задание: ${stepTitle}. Код: ${code}` }
        ],
      }),
    });

    const data = await response.json();
    const feedback = data.choices[0].message.content;

    // Расчет награды
    let reward = 0;
    if (feedback.includes("СИСТЕМА В НОРМЕ")) {
      if (level === 'beginner') reward = 1;
      else if (level === 'intermediate') reward = 5;
      else if (level === 'advanced') reward = 10;
    }

    return NextResponse.json({ feedback, reward });
  } catch (e) {
    return NextResponse.json({ feedback: "Ошибка.", reward: 0 }, { status: 500 });
  }
}