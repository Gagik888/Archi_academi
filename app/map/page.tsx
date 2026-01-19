"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ShoppingBag, X, Trophy, LogOut, Globe, Code, RefreshCcw, ArrowRight } from "lucide-react";
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
  
  const [lesson, setLesson] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [checking, setChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  // 1. Загрузка профиля при входе
  useEffect(() => {
    const loadProfile = async () => {
      const ip = localStorage.getItem("archi_user_ip");
      if (!ip) { window.location.href = "/login"; return; }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("ip_address", ip)
        .single();

      if (error || !data) {
        window.location.href = "/login";
      } else {
        setUser(data);
        setCoins(data.coins || 0);
        setActiveSkin(data.active_skin || "green");
        setUnlockedSkins(data.unlocked_skins || ["green"]);
      }
    };
    loadProfile();
  }, []);

  // 2. Проверка кода и начисление коинов
  const checkCode = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/chat/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: userCode, 
          stepTitle: currentStep, 
          topic: user?.current_course || "Python" 
        }),
      });
      
      const result = await res.json();
      setFeedback(result.feedback);

      // Ищем "Награда: XX" в ответе Арчи
      const rewardMatch = result.feedback.match(/Награда:\s*(\d+)/i);
      if (rewardMatch && user?.ip_address) {
        const reward = parseInt(rewardMatch[1]);
        const newBalance = coins + reward;

        const { error } = await supabase
          .from('profiles')
          .update({ coins: newBalance })
          .eq('ip_address', user.ip_address);

        if (!error) setCoins(newBalance);
      }
    } catch (e) {
      setFeedback("Ошибка связи с Арчи 🤖");
    } finally {
      setChecking(false);
    }
  };

  const buyOrSelectSkin = async (skinId: string, price: number) => {
    if (unlockedSkins.includes(skinId)) {
      await supabase.from('profiles').update({ active_skin: skinId }).eq('ip_address', user.ip_address);
      setActiveSkin(skinId);
    } else if (coins >= price) {
      const newCoins = coins - price;
      const newUnlocked = [...unlockedSkins, skinId];
      await supabase.from('profiles').update({
        coins: newCoins, unlocked_skins: newUnlocked, active_skin: skinId
      }).eq('ip_address', user.ip_address);
      setCoins(newCoins); setUnlockedSkins(newUnlocked); setActiveSkin(skinId);
    }
  };

  const getLesson = async (stepTitle: string) => {
    setLoadingLesson(true); setLesson(null); setFeedback(""); setUserCode(""); setCurrentStep(stepTitle);
    try {
      const res = await fetch('/api/chat/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepTitle, topic: user?.current_course }),
      });
      const result = await res.json();
      setLesson(result.text);
    } catch (e) { setLesson("## Ошибка загрузки"); } finally { setLoadingLesson(false); }
  };

  if (!user) return null;
  const skinColor = SKINS.find(s => s.id === activeSkin)?.color || '#00ff00';

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER - СТИЛЬНЫЙ НЕОН */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(15px)', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, borderBottom: `1px solid ${skinColor}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={`/archi-${activeSkin}.png`} style={{ width: '45px', filter: `drop-shadow(0 0 10px ${skinColor})` }} />
          <div>
            <div style={{ fontWeight: '900', letterSpacing: '2px', color: skinColor, fontSize: '1.2rem' }}>ARCHI</div>
            <div style={{ fontSize: '0.6rem', color: '#444' }}>USER: {user.username}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setShowShop(true)} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.3s' }}>
            <ShoppingBag size={18} color={skinColor} /> <span>SHOP</span>
          </button>
          <div style={{ background: '#000', padding: '10px 20px', borderRadius: '15px', border: `1px solid ${skinColor}55`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: skinColor, fontWeight: 'bold' }}>{coins} 🪙</span>
          </div>
          <button onClick={() => { localStorage.removeItem("archi_user_ip"); window.location.href = "/login"; }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}><LogOut size={20}/></button>
        </div>
      </div>

      {/* MAP CONTENT */}
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '130px', paddingBottom: '100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '10px', background: `linear-gradient(to bottom, #fff, ${skinColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user.current_course}
          </h1>
          <p style={{ color: '#555' }}>Выбери этап обучения и начни практиковаться</p>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {["Введение", "Переменные", "Условия", "Циклы", "Функции"].map((lvl, i) => (
            <button key={i} onClick={() => getLesson(lvl)} style={{ background: '#0d0d0d', border: '1px solid #222', padding: '30px', borderRadius: '25px', color: '#fff', textAlign: 'left', borderLeft: `8px solid ${skinColor}`, cursor: 'pointer', transition: '0.3s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: skinColor, fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>STEP {i + 1}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '600' }}>{lvl}</div>
              </div>
              <ArrowRight color="#333" />
            </button>
          ))}
        </div>
      </div>

      {/* LESSON WINDOW - ТЕМНЫЙ ПРЕМИУМ */}
      {lesson && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 150, overflowY: 'auto', padding: '20px' }}>
          <div style={{ maxWidth: '900px', margin: '40px auto', background: '#0d0d0d', borderRadius: '40px', border: '1px solid #222', padding: '50px', position: 'relative' }}>
            <X onClick={() => setLesson(null)} style={{ position: 'absolute', top: '30px', right: '30px', cursor: 'pointer', color: '#555' }} size={30} />
            <h2 style={{ color: skinColor, fontSize: '2.2rem', marginBottom: '30px' }}>{currentStep}</h2>
            
            <div style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.8' }}>
              <ReactMarkdown>{lesson}</ReactMarkdown>
            </div>

            <div style={{ background: '#000', borderRadius: '30px', padding: '35px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: skinColor }}>
                <Code size={20} /> <span style={{ fontWeight: 'bold' }}>PYTHON EDITOR</span>
              </div>
              <Editor
                value={userCode}
                onValueChange={c => setUserCode(c)}
                highlight={c => highlight(c, languages.python, 'python')}
                padding={25}
                style={{ fontFamily: 'monospace', fontSize: 17, background: '#050505', borderRadius: '20px', border: '1px solid #222', marginBottom: '25px' }}
              />
              <button onClick={checkCode} disabled={checking} style={{ width: '100%', background: skinColor, color: '#000', padding: '20px', borderRadius: '20px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '1.2rem', transition: '0.3s' }}>
                {checking ? "ПРОВЕРЯЮ..." : "ОТПРАВИТЬ РЕШЕНИЕ"}
              </button>

              {feedback && (
                <div style={{ marginTop: '30px', padding: '25px', background: '#111', borderRadius: '25px', border: `1px solid ${skinColor}44`, display: 'flex', gap: '20px' }}>
                  <img src={`/archi-${activeSkin}.png`} style={{ width: '50px', height: '50px' }} />
                  <div>
                    <b style={{ color: skinColor }}>ARCHI:</b>
                    <p style={{ margin: '5px 0 0 0', lineHeight: '1.5' }}>{feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHOP - ТАКОЙ ЖЕ КРАСИВЫЙ */}
      {showShop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0d0d0d', padding: '40px', borderRadius: '40px', border: '1px solid #333', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
              <h2 style={{ color: skinColor, margin: 0 }}>Магазин Арчи</h2>
              <X onClick={() => setShowShop(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {SKINS.map(s => (
                <div key={s.id} style={{ background: '#111', padding: '20px', borderRadius: '25px', textAlign: 'center', border: activeSkin === s.id ? `2px solid ${s.color}` : '1px solid #222' }}>
                  <img src={`/archi-${s.id}.png`} style={{ width: '60px', marginBottom: '15px' }} />
                  <button onClick={() => buyOrSelectSkin(s.id, s.price)} style={{ width: '100%', padding: '12px', borderRadius: '15px', background: unlockedSkins.includes(s.id) ? s.color : '#222', color: unlockedSkins.includes(s.id) ? '#000' : '#666', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
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
