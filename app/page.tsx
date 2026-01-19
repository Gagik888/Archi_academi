"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);

  const generateCourse = async () => {
    if (!topic) return;
    const ip = localStorage.getItem("archi_user_ip");
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level }),
      });
      const data = await res.json();
      
      // Сохраняем структуру курса в Supabase (поле course_structure)
      await supabase.from("profiles").update({ 
        current_course: topic,
        course_structure: data.levels 
      }).eq("ip_address", ip);

      window.location.href = '/map';
    } catch (e) {
      alert("Ошибка при создании пути");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <img src="/archi.png" style={{ width: '150px', filter: 'drop-shadow(0 0 20px #00ff0044)', animation: 'float 3s infinite ease-in-out' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#00ff00', marginTop: '20px' }}>ARCHI ACADEMY</h1>
      
      <div style={{ width: '100%', maxWidth: '420px', marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            placeholder="Какую технологию изучим?" 
            onChange={(e) => setTopic(e.target.value)}
            style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '20px', borderRadius: '20px', color: '#fff', fontSize: '1rem', outline: 'none' }}
          />
        </div>
        
        <button 
          onClick={generateCourse}
          disabled={loading || !topic}
          style={{ background: '#00ff00', color: '#000', padding: '20px', borderRadius: '20px', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          {loading ? "СТРОИМ НЕЙРОННЫЙ ПУТЬ..." : <><Sparkles size={20} /> ПОСТРОИТЬ ПУТЬ</>}
        </button>
      </div>
      <style jsx>{` @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } } `}</style>
    </div>
  );
}
