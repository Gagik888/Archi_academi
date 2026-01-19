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
  const [data, setData] = useState<any>(null);
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

  useEffect(() => {
    const checkUser = async () => {
      const storedIp = localStorage.getItem("archi_user_ip");
      if (!storedIp) { window.location.href = "/login"; return; }
      setUserIp(storedIp);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("ip_address", storedIp)
        .single();

      if (error || !profile) {
        window.location.href = "/login";
      } else {
        setData(profile); 
        setCoins(profile.coins || 0);
        setActiveSkin(profile.active_skin || "green");
        setUnlockedSkins(profile.unlocked_skins || ["green"]);
      }
    };
    checkUser();
  }, []);

  const checkCode = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/chat/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: userCode, 
          stepTitle: currentStep, 
          topic: data?.courseTitle 
        }),
      });
      
      const result = await res.json();
      setFeedback(result.feedback);

      // ЛОГИКА НАЧИСЛЕНИЯ КОИНОВ ИЗ ТЕКСТА ИИ
      const rewardMatch = result.feedback.match(/Награда:\s*(\d+)/i);
      if (rewardMatch && userIp) {
        const rewardAmount = parseInt(rewardMatch[1]);
        
        // Получаем свежий баланс, чтобы не было ошибок синхронизации
        const { data: freshProfile } = await supabase
          .from('profiles')
          .select('coins')
          .eq('ip_address', userIp)
          .single();

        const newBalance = (freshProfile?.coins || 0) + rewardAmount;

        const { error: upError } = await supabase
          .from('profiles')
          .update({ coins: newBalance })
          .eq('ip_address', userIp);

        if (!upError) {
          setCoins(newBalance);
        }
      }
    } catch (e) {
      setFeedback("Ошибка связи с Арчи 🤖. Попробуй еще раз.");
    } finally {
      setChecking(false);
    }
  };

  const resetCourse = () => { if (confirm("Сменить курс?")) window.location.href = "/"; };
  const handleLogout = () => { localStorage.removeItem("archi_user_ip"); window.location.href = "/login"; };

  const buyOrSelectSkin = async (skinId: string, price: number) => {
    if (unlockedSkins.includes(skinId)) {
      await supabase.from('profiles').update({ active_skin: skinId }).eq('ip_address', userIp);
      setActiveSkin(skinId);
    } else if (coins >= price) {
      const newCoins = coins - price;
      const newUnlocked = [...unlockedSkins, skinId];
      await supabase.from('profiles').update({
        coins: newCoins, unlocked_skins: newUnlocked, active_skin: skinId
      }).eq('ip_address', userIp);
      setCoins(newCoins); setUnlockedSkins(newUnlocked); setActiveSkin(skinId);
    } else { alert("Недостаточно коинов! Решай задачи 🤖"); }
  };

  const getLesson = async (stepTitle: string) => {
    setLoadingLesson(true); setLesson(null); setFeedback(""); setUserCode(""); setCurrentStep(stepTitle);
    try {
      const res = await fetch('/api/chat/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepTitle, topic: data?.courseTitle }),
      });
      const result = await res.json();
      setLesson(result.text);
    } catch (e) { setLesson("## Ошибка загрузки этапа"); } finally { setLoadingLesson(false); }
  };

  if (!data) return <div style={{background:'#050505', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#666'}}>Загрузка ARCHI...</div>;
  const skinColor = SKINS.find(s => s.id === activeSkin)?.color || '#00ff00';

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* HEADER */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(10px)', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={`/archi-${activeSkin}.png`} style={{ width: '40px', height: '40px' }} />
          <div>
            <div style={{ fontWeight: '900', letterSpacing: '2px', color: skinColor }}>ARCHI</div>
            <div style={{ fontSize: '0.6rem', color: '#444' }}>{userIp}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setShowShop(true)} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer' }}>
            <ShoppingBag size={18} color={skinColor} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#111', padding: '8px 18px', borderRadius: '15px', border: '1px solid #333' }}>
            <img src="/coin.png" style={{ width: '22px' }} />
            <span style={{ color: '#00ff00', fontWeight: 'bold' }}>{coins}</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }}><LogOut size={20}/></button>
        </div>
      </div>

      {/* MAP CONTENT */}
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '120px' }}>
        <button onClick={resetCourse} style={{background:'none', border:'1px solid #222', color:'#444', padding:'10px', borderRadius:'10px', cursor:'pointer', marginBottom:'20px'}}><RefreshCcw size={14}/> СМЕНИТЬ КУРС</button>
        <h1 style={{ textAlign: 'center', color: skinColor }}>{data?.courseTitle || "Загрузка..."}</h1>
        <div style={{ display: 'grid', gap: '15px', marginTop: '40px' }}>
          {(data?.levels || []).map((lvl: any, i: number) => (
            <button key={i} onClick={() => getLesson(lvl)} style={{ background: '#0d0d0d', border: '1px solid #222', padding: '25px', borderRadius: '20px', color: '#fff', textAlign: 'left', borderLeft: `6px solid ${skinColor}`, cursor: 'pointer' }}>
              <div style={{fontSize:'0.7rem', color:skinColor}}>ЭТАП {i+1}</div>
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* LESSON OVERLAY */}
      {lesson && (
        <div style={{ position: 'fixed', inset: 0, background: '#050505', zIndex: 150, overflowY: 'auto', padding: '40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px'}}>
               <h2 style={{color:skinColor}}>{currentStep}</h2>
               <X onClick={() => setLesson(null)} style={{cursor:'pointer'}}/>
            </div>
            <ReactMarkdown style={{lineHeight:'1.6', color:'#ccc'}}>{lesson}</ReactMarkdown>
            <div style={{marginTop:'40px', background:'#0d0d0d', padding:'30px', borderRadius:'30px', border:'1px solid #222'}}>
               <Editor value={userCode} onValueChange={c => setUserCode(c)} highlight={c => highlight(c, languages.python, 'python')} padding={20} style={{fontFamily:'monospace', fontSize:16, background:'#000', borderRadius:'15px', marginBottom:'20px'}} />
               <button onClick={checkCode} disabled={checking} style={{width:'100%', padding:'20px', background:skinColor, border:'none', borderRadius:'15px', fontWeight:'bold', cursor:'pointer'}}>
                 {checking ? "ПРОВЕРЯЮ..." : "ОТПРАВИТЬ РЕШЕНИЕ"}
               </button>
               {feedback && (
                 <div style={{marginTop:'20px', display:'flex', gap:'15px', background:'#151515', padding:'20px', borderRadius:'20px', border:`1px solid ${skinColor}33`}}>
                   <img src={`/archi-${activeSkin}.png`} style={{width:'40px', height:'40px'}} />
                   <p>{feedback}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* SHOP MODAL */}
      {showShop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0d0d0d', padding: '40px', borderRadius: '30px', width: '90%', maxWidth: '500px' }}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3>Магазин скинов</h3>
              <X onClick={() => setShowShop(false)} style={{cursor:'pointer'}}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {SKINS.map(s => (
                <div key={s.id} style={{background:'#111', padding:'15px', borderRadius:'20px', textAlign:'center', border: activeSkin === s.id ? `2px solid ${s.color}` : '1px solid #222'}}>
                  <img src={`/archi-${s.id}.png`} style={{width:'50px'}} />
                  <button onClick={() => buyOrSelectSkin(s.id, s.price)} style={{width:'100%', marginTop:'10px', background: unlockedSkins.includes(s.id) ? s.color : '#333', border:'none', borderRadius:'10px', padding:'5px', cursor:'pointer', fontWeight:'bold'}}>
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
