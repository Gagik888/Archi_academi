"use client";
import { useState } from "react";

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [time, setTime] = useState("30");
  const [loading, setLoading] = useState(false);

  const generateCourse = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level, time }),
      });
      const data = await res.json();
      localStorage.setItem('courseData', JSON.stringify(data));
      window.location.href = '/map';
    } catch (e) {
      alert("Ошибка при создании пути");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Логотип Арчи PNG с анимацией */}
      <div style={{ marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>
        <img 
          src="/archi.png" 
          alt="Archi Robot" 
          style={{ width: '160px', height: '160px', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.4))' }} 
        />
      </div>

      <h1 style={{ fontSize: '3.5rem', color: '#00ff00', fontWeight: '900', letterSpacing: '8px', marginBottom: '5px', textShadow: '0 0 15px rgba(0,255,0,0.3)' }}>ARCHI</h1>
      <p style={{ color: '#666', marginBottom: '40px', letterSpacing: '3px', fontSize: '0.8rem' }}>AI ACADEMY ARCHITECT</p>

      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          placeholder="Чему хочешь научиться?" 
          onChange={(e) => setTopic(e.target.value)}
          style={{ background: '#111', border: '1px solid #333', padding: '18px', borderRadius: '15px', color: '#fff', outline: 'none', fontSize: '1rem' }}
        />
        
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ background: '#111', border: '1px solid #333', padding: '15px', borderRadius: '15px', color: '#fff', cursor: 'pointer' }}>
          <option value="beginner">Новичок (с нуля)</option>
          <option value="intermediate">Средний уровень</option>
          <option value="advanced">Продвинутый</option>
        </select>

        <select value={time} onChange={(e) => setTime(e.target.value)} style={{ background: '#111', border: '1px solid #333', padding: '15px', borderRadius: '15px', color: '#fff', cursor: 'pointer' }}>
          <option value="15">15 мин в день</option>
          <option value="30">30 мин в день</option>
          <option value="60">1 час в день</option>
        </select>

        <button 
          onClick={generateCourse}
          disabled={loading || !topic}
          style={{ background: '#00ff00', color: '#000', padding: '20px', borderRadius: '15px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '1.1rem', transition: '0.3s', marginTop: '10px' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {loading ? "АРХИТЕКТОР ДУМАЕТ..." : "ПОСТРОИТЬ ПУТЬ"}
        </button>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}