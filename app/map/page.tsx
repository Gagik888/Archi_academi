"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import ReactMarkdown from "react-markdown";
import { ShoppingBag, X, Trophy, LogOut, Globe, Code, RefreshCcw, ArrowRight, Star } from "lucide-react";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

const SKINS = [
  { id: 'green', name: 'Neon Green', color: '#00ff00', price: 0 },
  { id: 'blue', name: 'Cyber Blue', color: '#00ccff', price: 50 },
  { id: 'red', name: 'Ruby Red', color: '#ff4d4d', price: 50 },
  { id: 'yellow', name: 'Gold Flash', color: '#ffcc00', price: 50 },
  { id: 'white', name: 'Pure White', color: '#ffffff', price: 100 },
];

export default function MapPage() {
  const [user, setUser] = useState<any>(null);
  const [coins, setCoins] = useState(0);
  const [activeSkin, setActiveSkin] = useState("green");
  const [unlockedSkins, setUnlockedSkins] = useState(["green"]);
  const [showShop, setShowShop] = useState(false);
  const [showLeaders, setShowLeaders] = useState(false);
  const [leaders, setLeaders] = useState<any[]>([]);
  
  const [lesson, setLesson] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [checking, setChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const ip = localStorage.getItem("archi_user_ip");
    if (!ip) { window.location.href = "/login"; return; }
    const { data } = await supabase.from("profiles").select("*").eq("ip_address", ip).single();
    if (data) {
      setUser(data);
      setCoins(data.coins || 0);
      setActiveSkin(data.active_skin || "green");
      setUnlockedSkins(data.unlocked_skins || ["green"]);
    }
  };

  const loadLeaders = async () => {
    const { data } = await supabase.from("profiles").select("username, coins").order("coins", { ascending: false }).limit(5);
    setLeaders(data || []);
    setShowLeaders(true);
  };

  const checkCode = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/chat/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: userCode, stepTitle: currentStep, topic: user?.current_course })
      });
      const result = await res.json();
      setFeedback(result.feedback);

      const rewardMatch = result.feedback.match(/Награда:\s*(\d+)/i);
      if (rewardMatch && user?.ip_address) {
        const reward = parseInt(rewardMatch[1]);
        const newBalance = coins + reward;
        await supabase.from('profiles').update({ coins: newBalance }).eq('ip_address', user.ip_address);
        setCoins(newBalance);
      }
    } catch (e) { setFeedback("Ошибка связи с Арчи 🤖"); } finally { setChecking(false); }
  };

  const resetCourse = async () => {
    if (confirm("Сбросить текущий курс и выбрать новый?")) {
      await supabase.from('profiles').update({ current_course: 'Python' }).eq('ip_address', user.ip_address);
      window.location.href = "/"; 
    }
  };

  if (!user) return null;
  const skinColor = SKINS.find(s => s.id === activeSkin)?.color || '#00ff00';

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(20px)', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, borderBottom: `1px solid ${skinColor}44` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={`/archi-${activeSkin}.png`} style={{ width: '45px', filter: `drop-shadow(0 0 8px ${skinColor})` }} />
          <div>
            <div style={{ fontWeight: '900', color: skinColor, letterSpacing: '1px' }}>ARCHI ACADEMY</div>
            <div style={{ fontSize: '0.7rem', color: '#555' }}>{user.username}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={loadLeaders} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Trophy size={18} color="#ffd700" /></button>
          <button onClick={() => setShowShop(true)} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', display: 'flex', gap: '8px', fontWeight: 'bold' }}>
            <ShoppingBag size={18} color={skinColor} /> МАГАЗИН
          </button>
          <div style={{ background: '#000', padding: '10px 20px', borderRadius: '12px', border: `2px solid ${skinColor}`, boxShadow: `0 0 10px ${skinColor}33`, display: 'flex', alignItems: 'center', gap: '10px' }}>
             <img src="/coin.png" style={{ width: '20px' }} />
             <span style={{ color: skinColor, fontWeight: '900' }}>{coins}</span>
          </div>
          <button onClick={() => { localStorage.removeItem("archi_user_ip"); window.location.href = "/login"; }} style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer' }}><LogOut size={20}/></button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '120px', paddingBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
           <h1 style={{ fontSize: '2.5rem', fontWeight: '900', textShadow: `0 0 20px ${skinColor}44` }}>{user.current_course}</h1>
           <button onClick={resetCourse} style={{ background: '#111', border: '1px solid #222', color: '#666', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
             <RefreshCcw size={14} /> СМЕНИТЬ КУРС
           </button>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {["Основы", "Переменные", "Условия", "Списки", "Циклы"].map((lvl, i) => (
            <button key={i} onClick={() => {setCurrentStep(lvl); setLesson("# Загрузка..."); fetch('/api/chat/lesson', {method:'POST', body:JSON.stringify({stepTitle:lvl, topic:user.current_course})}).then(r=>r.json()).then(d=>setLesson(d.text))}} style={{ background: '#0d0d0d', border: '1px solid #222', padding: '25px', borderRadius: '20px', textAlign: 'left', borderLeft: `6px solid ${skinColor}`, cursor: 'pointer', transition: '0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ color: skinColor, fontSize: '0.7rem', fontWeight: 'bold' }}>LEVEL {i+1}</div>
                 <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '5px' }}>{lvl}</div>
               </div>
               <ArrowRight size={20} color="#222" />
            </button>
          ))}
        </div>
      </div>

      {/* LEADERS MODAL */}
      {showLeaders && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0d0d0d', padding: '40px', borderRadius: '30px', border: '1px solid #333', width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ color: '#ffd700', margin: 0 }}>ТОП ИГРОКОВ</h2>
              <X onClick={() => setShowLeaders(false)} style={{ cursor: 'pointer' }} />
            </div>
            {leaders.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: i === 0 ? '#1a1a00' : '#111', borderRadius: '15px', marginBottom: '10px', border: i === 0 ? '1px solid #ffd700' : '1px solid #222' }}>
                <span>{i + 1}. {l.username}</span>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{l.coins} 🪙</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LESSON & EDITOR (KEEP PREVIOUS STYLE) */}
      {lesson && (
        <div style={{ position: 'fixed', inset: 0, background: '#050505', zIndex: 150, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
             <X onClick={() => setLesson(null)} style={{ float: 'right', cursor: 'pointer' }} size={30} />
             <h2 style={{ color: skinColor, fontSize: '2rem' }}>{currentStep}</h2>
             <div style={{ margin: '30px 0', color: '#aaa', lineHeight: '1.7' }}><ReactMarkdown>{lesson}</ReactMarkdown></div>
             <div style={{ background: '#0d0d0d', padding: '30px', borderRadius: '30px', border: '1px solid #222' }}>
               <Editor value={userCode} onValueChange={c => setUserCode(c)} highlight={c => highlight(c, languages.python, 'python')} padding={20} style={{ fontFamily: 'monospace', fontSize: 16, background: '#000', borderRadius: '15px', marginBottom: '20px', border: '1px solid #222' }} />
               <button onClick={checkCode} disabled={checking} style={{ width: '100%', padding: '20px', background: skinColor, color: '#000', borderRadius: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>{checking ? "ПРОВЕРКА..." : "ОТПРАВИТЬ РЕШЕНИЕ"}</button>
               {feedback && <div style={{ marginTop: '20px', background: '#111', padding: '20px', borderRadius: '20px', border: `1px solid ${skinColor}33` }}>{feedback}</div>}
             </div>
          </div>
        </div>
      )}

      {/* SHOP (KEEP PREVIOUS STYLE) */}
      {showShop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ background: '#0d0d0d', padding: '40px', borderRadius: '30px', width: '450px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}><h3>МАГАЗИН</h3><X onClick={() => setShowShop(false)} style={{ cursor: 'pointer' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {SKINS.map(s => (
                  <div key={s.id} style={{ background: '#111', padding: '15px', borderRadius: '20px', textAlign: 'center', border: activeSkin === s.id ? `2px solid ${s.color}` : '1px solid #222' }}>
                    <img src={`/archi-${s.id}.png`} style={{ width: '50px' }} />
                    <button onClick={async () => {
                      if (unlockedSkins.includes(s.id)) {
                        await supabase.from('profiles').update({ active_skin: s.id }).eq('ip_address', user.ip_address);
                        setActiveSkin(s.id);
                      } else if (coins >= s.price) {
                        const newC = coins - s.price;
                        const newU = [...unlockedSkins, s.id];
                        await supabase.from('profiles').update({ coins: newC, unlocked_skins: newU, active_skin: s.id }).eq('ip_address', user.ip_address);
                        setCoins(newC); setUnlockedSkins(newU); setActiveSkin(s.id);
                      }
                    }} style={{ width: '100%', marginTop: '10px', background: unlockedSkins.includes(s.id) ? s.color : '#222', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', fontWeight: 'bold', color: unlockedSkins.includes(s.id) ? '#000' : '#666' }}>
                      {unlockedSkins.includes(s.id) ? "ВЫБРАТЬ" : `${s.price} 🪙`}
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
