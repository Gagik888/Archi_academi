"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, ArrowRight } from "lucide-react";

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
    if (!nickname || !ip) return alert("Введите имя");
    setLoading(true);

    const { data: user } = await supabase.from("profiles").select("*").eq("ip_address", ip).single();

    if (!user) {
      await supabase.from("profiles").insert([{ ip_address: ip, username: nickname }]);
    } else {
      await supabase.from("profiles").update({ username: nickname }).eq("ip_address", ip);
    }

    localStorage.setItem("archi_user_ip", ip);
    window.location.href = "/map";
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ background: '#0d0d0d', padding: '40px', borderRadius: '30px', border: '1px solid #222', width: '350px', textAlign: 'center' }}>
        <h1 style={{ color: '#00ff00' }}>ARCHI ACADEMY</h1>
        <input 
          style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #333', borderRadius: '15px', color: '#fff', margin: '20px 0' }}
          placeholder="Ваше имя"
          onChange={(e) => setNickname(e.target.value)}
        />
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', background: '#00ff00', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? "ВХОД..." : "НАЧАТЬ"}
        </button>
      </div>
    </div>
  );
}
