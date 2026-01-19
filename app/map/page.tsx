"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import ReactMarkdown from "react-markdown";
import { Globe, ShoppingBag, Code, CheckCircle } from "lucide-react";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

export default function MapPage() {
  const [user, setUser] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Загрузка профиля
  useEffect(() => {
    const loadProfile = async () => {
      const ip = localStorage.getItem("archi_user_ip");
      if (!ip) return window.location.href = "/login";
      
      const { data } = await supabase.from("profiles").select("*").eq("ip_address", ip).single();
      if (!data) return window.location.href = "/login";
      setUser(data);
    };
    loadProfile();
  }, []);

  // 2. Проверка кода
  const checkCode = async () => {
    setLoading(true);
    const res = await fetch("/api/chat/check", {
      method: "POST",
      body: JSON.stringify({ code, stepTitle: "Практика", topic: user.current_course })
    });
    const result = await res.json();
    setFeedback(result.feedback);

    // Парсим награду
    const rewardMatch = result.feedback.match(/Награда:\s*(\d+)/i);
    if (rewardMatch) {
      const reward = parseInt(rewardMatch[1]);
      const newCoins = (user.coins || 0) + reward;
      await supabase.from("profiles").update({ coins: newCoins }).eq("ip_address", user.ip_address);
      setUser({ ...user, coins: newCoins });
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      {/* Шапка */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ background: '#00ff00', width: '40px', height: '40px', borderRadius: '10px' }}></div>
          <b>{user.username}</b>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>🪙 {user.coins}</span>
          <Globe size={20} />
        </div>
      </header>

      {/* Контент */}
      <main style={{ maxWidth: '800px', margin: '40px auto' }}>
        <h1>Курс: {user.current_course}</h1>
        <div style={{ background: '#0d0d0d', padding: '30px', borderRadius: '20px', border: '1px solid #222' }}>
          <h3>Задание: Выведи "Hello World"</h3>
          <div style={{ background: '#000', borderRadius: '10px', margin: '20px 0' }}>
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={c => highlight(c, languages.python, 'python')}
              padding={20}
              style={{ fontFamily: 'monospace', fontSize: 16 }}
            />
          </div>
          <button onClick={checkCode} style={{ width: '100%', padding: '15px', background: '#00ff00', color: '#000', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "ПРОВЕРКА..." : "ПРООВЕРИТЬ"}
          </button>
          
          {feedback && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#1a1a1a', borderRadius: '10px', borderLeft: '4px solid #00ff00' }}>
              {feedback}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
