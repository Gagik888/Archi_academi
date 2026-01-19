"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SimpleLoginPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (username.length < 2) return alert("Имя слишком короткое!");
    setLoading(true);

    try {
      // 1. Получаем IP пользователя
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipRes.json();

      // 2. Ищем пользователя с таким IP в таблице profiles
      // Мы используем IP вместо ID от Auth
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ip) // В поле id будем хранить IP
        .single();

      if (existingUser) {
        // Если IP уже есть, просто заходим
        localStorage.setItem('archi_user_ip', ip);
        window.location.href = "/map";
      } else {
        // Если IP новый, создаем профиль
        const { error } = await supabase
          .from('profiles')
          .insert([{ 
            id: ip, 
            username: username, 
            coins: 0, 
            active_skin: 'green',
            unlocked_skins: ['green'] 
          }]);

        if (error) throw error;
        
        localStorage.setItem('archi_user_ip', ip);
        window.location.href = "/map";
      }
    } catch (e) {
      alert("Ошибка при входе. Попробуй еще раз.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ background: '#111', padding: '40px', borderRadius: '30px', border: '1px solid #333', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
        <img src="/archi-green.png" style={{ width: '100px', marginBottom: '20px' }} />
        <h2 style={{ color: '#00ff00', marginBottom: '10px' }}>Вход в Академию</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>Твой прогресс привязан к твоему IP</p>
        
        <input 
          placeholder="Придумай имя..." 
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #333', borderRadius: '12px', color: '#fff', marginBottom: '20px', outline: 'none' }}
        />
        
        <button 
          onClick={handleJoin} 
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: '#00ff00', color: '#000', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? "ПОДКЛЮЧЕНИЕ..." : "НАЧАТЬ ОБУЧЕНИЕ"}
        </button>
      </div>
    </div>
  );
}