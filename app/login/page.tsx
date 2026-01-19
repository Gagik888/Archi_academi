"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setIp(data.ip));
  }, []);

  const handleLogin = async () => {
    if (!nickname.trim()) return;
    setLoading(true);

    const { data: user } = await supabase.from("profiles").select("*").eq("ip_address", ip).single();

    if (!user) {
      await supabase.from("profiles").insert([{ 
        ip_address: ip, 
        username: nickname, 
        coins: 10, // Бонус за регистрацию
        active_skin: 'green' 
      }]);
    } else {
      await supabase.from("profiles").update({ username: nickname }).eq("ip_address", ip);
    }

    localStorage.setItem("archi_user_ip", ip);
    window.location.href = "/";
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ background: '#0d0d0d', padding: '50px 40px', borderRadius: '40px', border: '1px solid #00ff0033', width: '380px', textAlign: 'center', boxShadow: '0 0 50px rgba(0,255,0,0.1)' }}>
        <div style={{ background: '#00ff0011', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid #00ff0044' }}>
          <Terminal color="#00ff00" size={35} />
        </div>
        <h1 style={{ color: '#00ff00', letterSpacing: '4px', marginBottom: '10px' }}>ARCHI LOGIN</h1>
        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '30px' }}>Ваш IP: {ip || "определение..."}</p>
        
        <input 
          style={{ width: '100%', padding: '18px', background: '#000', border: '1px solid #222', borderRadius: '15px', color: '#fff', marginBottom: '20px', textAlign: 'center', fontSize: '1.1rem', outline: 'none' }}
          placeholder="Введите никнейм"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          onChange={(e) => setNickname(e.target.value)}
        />
        
        <button onClick={handleLogin} disabled={loading || !ip} style={{ width: '100%', background: '#00ff00', color: '#000', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,255,0,0.3)' }}>
          {loading ? "АВТОРИЗАЦИЯ..." : "ВОЙТИ В СИСТЕМУ"}
        </button>
      </div>
    </div>
  );
}
