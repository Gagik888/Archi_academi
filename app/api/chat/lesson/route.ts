import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { stepTitle, topic } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Ты Арчи. Пиши уроки в Markdown. Используй ## для заголовков. 
            Код пиши только в блоках \`\`\`python ... \`\`\`. 
            В конце добавь "### Практическое задание".`
          },
          { role: "user", content: `Тема курса: ${topic}. Напиши урок для: ${stepTitle}` }
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json({ text: data.choices[0].message.content });
  } catch (e) {
    return NextResponse.json({ text: "Ошибка." }, { status: 500 });
  }
}