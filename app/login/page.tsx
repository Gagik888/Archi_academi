"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Скрыто получаем IP при загрузке
  useEffect(() => {
    const getIp = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setIp(data.ip);
        localStorage.setItem("archi_user_ip", data.ip);
      } catch (e) {
        console.error("Ошибка IP:", e);
      }
    };
    getIp();
  }, []);

  const handleLogin = async () => {
    if (!nickname.trim()) return alert("Придумай имя!");
    if (!ip) return alert("Соединение устанавливается, подожди секунду...");
    setLoading(true);

    try {
      // 2. Ищем пользователя по ip_address
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("*")
        .eq("ip_address", ip)
        .single();

      if (existingUser) {
        // Обновляем имя, если зашли под новым
        await supabase
          .from("profiles")
          .update({ username: nickname })
          .eq("ip_address", ip);
      } else {
        // Создаем нового пользователя (id база поставит сама: 1, 2, 3...)
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([
            { 
              ip_address: ip, 
              username: nickname, 
              coins: 0,
              active_skin: 'green',
              unlocked_skins: ['green']
            }
          ]);

        if (insertError) throw insertError;
      }

      // 3. Сохраняем IP локально и идем на карту
      localStorage.setItem("archi_user_ip", ip);
      window.location.href = "/map";

    } catch (err: any) {
      console.error(err);
      alert("Ошибка входа: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: '#050505', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      color: '#fff' 
    }}>
      <div style={{ 
        background: '#0d0d0d', 
        padding: '40px', 
        borderRadius: '30px', 
        border: '1px solid #222', 
        width: '100%', 
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <img src="/archi-green.png" style={{ width: '80px', marginBottom: '20px' }} alt="Archi" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#00ff00', marginBottom: '10px' }}>ARCHI ACADEMY</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Вход в систему обучения</p>

        <div style={{ textAlign: 'left', marginBottom: '30px' }}>
          <label style={{ display: 'block', color: '#444', fontSize: '0.8rem', marginBottom: '8px', marginLeft: '10px' }}>ВАШЕ ИМЯ</label>
          <div style={{ background: '#000', padding: '5px', borderRadius: '15px', border: '1px solid #333', display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '0 15px' }}><User size={18} color="#666" /></div>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Введите никнейм..."
              style={{ background: 'transparent', border: 'none', color: '#fff', padding: '15px 0', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{ 
            width: '100%', 
            background: loading ? '#222' : '#00ff00', 
            color: '#000', 
            padding: '18px', 
            borderRadius: '15px', 
            fontWeight: '900', 
            border: 'none', 
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: '0.3s'
          }}
        >
          {loading ? "ЗАГРУЗКА..." : "НАЧАТЬ ОБУЧЕНИЕ"} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
