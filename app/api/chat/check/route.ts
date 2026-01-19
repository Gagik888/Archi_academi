import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code, stepTitle, topic } = await req.json();

  const systemPrompt = `
    Ты — Арчи, ИИ-наставник. Проверь код ученика по теме "${topic}" (этап: "${stepTitle}").
    1. Если код верный: Напиши "✅ ОТЛИЧНО!". Объясни почему и в конце добавь: "Награда: 20 коинов".
    2. Если ошибка: Напиши "❌ ОШИБКА". Объясни как исправить.
    Пиши кратко и используй эмодзи.
  `;

  // Тут должен быть твой запрос к API нейросети (OpenAI, Anthropic или Google)
  // Для примера возвращаем заглушку:
  const aiFeedback = `✅ ОТЛИЧНО! Ты правильно использовал функции. Награда: 20 коинов`;

  return NextResponse.json({ feedback: aiFeedback });
}
