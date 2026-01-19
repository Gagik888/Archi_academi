"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ShoppingBag, X, Trophy, LogOut, Globe, Code, RefreshCcw } from "lucide-react";
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
  const [data, setData] = useState<any>(null); // Это данные профиля из базы
  const [coins, setCoins] = useState(0);
  const [activeSkin, setActiveSkin] = useState("green");
  const [unlockedSkins, setUnlockedSkins] = useState(["green"]);
  const [showShop, setShowShop] = useState(false);
  const [userIp, setUserIp] = useState<string | null>(null);
  
  const [lesson, setLesson] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [checking, setChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  // 1. ПРОВЕРКА ПОЛЬЗОВАТЕЛЯ ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    const checkUser = async () => {
      const storedIp = localStorage.getItem("archi_user_ip");

      if (!storedIp) {
        window.location.href = "/login";
        return;
      }

      setUserIp(storedIp);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("ip_address", storedIp)
        .single();

      if (error || !profile) {
        console.log("Пользователь не найден, редирект...");
        window.location.href = "/login";
      } else {
        // Заполняем состояние данными из базы
        setData(profile); 
        setCoins(profile.coins);
        setActiveSkin(profile.active_skin || "green");
        setUnlockedSkins(profile.unlocked_skins || ["green"]);
      }
    };

    checkUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("archi_user_ip");
    window.location.href = "/login";
  };

  const getLesson = async (stepTitle: string) => {
    setLoadingLesson(true);
    setLesson(null);
    setFeedback("");
    setUserCode("");
    setCurrentStep(stepTitle);
    try {
      const res = await fetch('/api/chat/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepTitle, topic: data?.courseTitle || "Python" }),
      });
      const result = await res.json();
      setLesson(result.text);
    } catch (e) {
      setLesson("## Ошибка загрузки контента");
    } finally {
      setLoadingLesson(false);
    }
  };

  const checkCode = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/chat/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: userCode, stepTitle: currentStep, topic: data?.courseTitle, level: data?.level 
        }),
      });
      const result = await res.json();
      setFeedback(result.feedback);

      if (result.reward > 0 && userIp) {
        const newBalance = coins + result.reward;
        // Обновляем в базе именно по ip_address
        await supabase.from('profiles').update({ coins: newBalance }).eq('ip_address', userIp);
        setCoins(newBalance);
      }
    } catch (e) {
      setFeedback("Ошибка связи с Арчи.");
    } finally {
      setChecking(false);
    }
  };

  // Вспомогательная функция (заглушка для сброса курса)
  const resetCourse = () => {
    alert("Функция сброса курса в разработке!");
  };

  // Покупка скина
  const buyOrSelectSkin = async (skinId: string, price: number) => {
    if (unlockedSkins.includes(skinId)) {
      await supabase.from('profiles').update({ active_skin: skinId }).eq('ip_address', userIp);
      setActiveSkin(skinId);
    } else {
      if (coins >= price) {
        const newCoins = coins - price;
        const newUnlocked = [...unlockedSkins, skinId];
        const { error } = await supabase.from('profiles').update({
          coins: newCoins,
          unlocked_skins: newUnlocked,
          active_skin: skinId
        }).eq('ip_address', userIp);

        if (!error) {
          setCoins(newCoins);
          setUnlockedSkins(newUnlocked);
          setActiveSkin(skinId);
        }
      } else {
        alert("Недостаточно коинов!");
      }
    }
  };

  if (!data) return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
      Загрузка профиля...
    </div>
  );

  const skinColor = SKINS.find(s => s.id === activeSkin)?.color || '#00ff00';

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(10px)', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={`/archi-${activeSkin}.png`} style={{ width: '40px', height: '40px', objectFit: 'contain' }} alt="Archi" />
          <div>
            <div style={{ fontWeight: '900', letterSpacing: '2px', color: skinColor }}>ARCHI</div>
            <div style={{ fontSize: '0.6rem', color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={10} /> {userIp}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setShowShop(true)} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} color={skinColor} /> <span style={{fontSize: '0.9rem'}}>Скины</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#111', padding: '8px 18px', borderRadius: '15px', border: '1px solid #333' }}>
            <img src="/coin.png" style={{ width: '22px' }} alt="Coin" />
            <span style={{ color: '#00ff00', fontWeight: 'bold' }}>{coins}</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }}><LogOut size={20}/></button>
        </div>
      </div>

      {/* SHOP */}
      {showShop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0f0f0f', padding: '35px', borderRadius: '35px', border: '1px solid #333', width: '100%', maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h2 style={{ color: skinColor }}>Магазин</h2>
              <X onClick={() => setShowShop(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
              {SKINS.map(skin => (
                <div key={skin.id} style={{ background: '#151515', padding: '20px', borderRadius: '25px', textAlign: 'center', border: activeSkin === skin.id ? `2px solid ${skin.color}` : '1px solid #222' }}>
                  <img src={`/archi-${skin.id}.png`} style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '10px' }} alt={skin.name} />
                  <button onClick={() => buyOrSelectSkin(skin.id, skin.price)} style={{ width: '100%', padding: '10px', borderRadius: '12px', background: unlockedSkins.includes(skin.id) ? skin.color : '#333', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>
                    {unlockedSkins.includes(skin.id) ? (activeSkin === skin.id ? "ВЫБРАНО" : "ИСПОЛЬЗОВАТЬ") : `${skin.price} 🪙`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAP */}
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '120px', paddingBottom: '100px' }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <button onClick={resetCourse} style={{background: 'transparent', border: '1px solid #333', color: '#666', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems:'center', fontSize: '0.8rem'}}>
                <RefreshCcw size={14}/> СМЕНИТЬ КУРС
            </button>
        </div>
        
        <h1 style={{ textAlign: 'center', color: skinColor, fontSize: '2.5rem', fontWeight: '900', marginTop: '20px' }}>{data?.courseTitle || "Python Курс"}</h1>
        
        <div style={{ display: 'grid', gap: '20px', marginTop: '50px' }}>
          {(data?.levels || ["Основы Python", "Переменные", "Циклы"]).map((lvl: string, i: number) => (
            <button key={i} onClick={() => getLesson(lvl)} style={{ background: '#111', border: '1px solid #222', padding: '30px', borderRadius: '25px', color: '#fff', textAlign: 'left', borderLeft: `8px solid ${skinColor}`, cursor: 'pointer', transition: '0.2s' }}>
              <div style={{ color: skinColor, fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px' }}>ЭТАП {i + 1}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{lvl}</div>
            </button>
          ))}
          
          <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', marginTop: '20px', background: 'transparent', border: `1px solid ${skinColor}55`, padding: '20px', borderRadius: '20px', color: skinColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
              <Trophy size={20} /> ТАБЛИЦА ЛИДЕРОВ
            </button>
          </Link>
        </div>
      </div>

      {/* LESSON WINDOW */}
      {lesson && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 150, overflowY: 'auto', padding: '20px' }}>
          <div style={{ maxWidth: '900px', margin: '40px auto', background: '#0d0d0d', borderRadius: '40px', border: '1px solid #222', padding: '50px', position: 'relative' }}>
            <X onClick={() => setLesson(null)} style={{ position: 'absolute', top: '30px', right: '30px', cursor: 'pointer', color: '#555' }} />
            <h2 style={{ color: skinColor, fontSize: '2rem', marginBottom: '40px' }}>{currentStep}</h2>
            
            <div style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.7' }}>
              <ReactMarkdown components={{
                p: ({children}) => <div style={{marginBottom: '1.5rem'}}>{children}</div>,
                code: ({inline, children}: any) => {
                    if (inline) return <code style={{background: '#222', padding: '3px 8px', borderRadius: '6px', color: skinColor}}>{children}</code>;
                    return (
                        <div style={{background: '#000', borderRadius: '15px', margin: '20px 0', border: '1px solid #333', padding: '20px', overflowX: 'auto'}}>
                            <code style={{color: '#50fa7b', fontFamily: 'monospace'}}>{children}</code>
                        </div>
                    );
                }
              }}>{lesson}</ReactMarkdown>
            </div>

            <div style={{ background: '#000', borderRadius: '30px', padding: '35px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Code color={skinColor} />
                <span style={{ color: skinColor, fontWeight: 'bold' }}>РЕДАКТОР КОДА</span>
              </div>
              <div style={{ background: '#050505', borderRadius: '15px', border: '1px solid #222', minHeight: '200px', marginBottom: '20px', overflow: 'hidden' }}>
                <Editor value={userCode} onValueChange={c => setUserCode(c)} highlight={c => highlight(c, languages.python, 'python')} padding={20} style={{ fontFamily: 'monospace', fontSize: 16 }} />
              </div>
              <button onClick={checkCode} disabled={checking} style={{ width: '100%', background: skinColor, color: '#000', padding: '20px', borderRadius: '18px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                {checking ? "ПРОВЕРКА..." : "ОТПРАВИТЬ РЕШЕНИЕ"}
              </button>
              {feedback && (
                <div style={{ marginTop: '25px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: `1px solid ${skinColor}33`, display: 'flex', gap: '15px' }}>
                  <img src={`/archi-${activeSkin}.png`} style={{ width: '40px', height: '40px', objectFit: 'contain' }} alt="Archi Feedback" />
                  <div><strong style={{color: skinColor, display: 'block', marginBottom: '5px'}}>Archi:</strong><p style={{margin: 0}}>{feedback}</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
