"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLeaders() {
      // Сортируем по монетам (от большего к меньшему)
      const { data } = await supabase
        .from('profiles')
        .select('username, coins, active_skin')
        .order('coins', { ascending: false })
        .limit(20);
      if (data) setLeaders(data);
    }
    fetchLeaders();
  }, []);

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link href="/map" style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '30px' }}>
          <ArrowLeft size={20} /> Назад к обучению
        </Link>

        <h1 style={{ color: '#00ff00', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '2.5rem', marginBottom: '40px' }}>
          <Trophy size={40} /> ТОП АРХИТЕКТОРОВ
        </h1>

        <div style={{ display: 'grid', gap: '15px' }}>
          {leaders.map((user, i) => (
            <div key={i} style={{ background: '#111', padding: '20px', borderRadius: '20px', border: i === 0 ? '1px solid #ffd700' : '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Здесь мы выводим номер места: 0+1=1, 1+1=2... */}
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: i === 0 ? '#ffd700' : '#444', width: '30px' }}>{i + 1}</span>
                <img src={`/archi-${user.active_skin || 'green'}.png`} style={{ width: '40px', height: '40px' }} />
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{user.username || "Аноним"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff00', fontWeight: 'bold' }}>
                {user.coins} <img src="/coin.png" style={{ width: '18px' }} />
              </div>
            </div>
          ))}
          {leaders.length === 0 && <p style={{color: '#666', textAlign: 'center'}}>Загрузка списка лидеров...</p>}
        </div>
      </div>
    </div>
  );
}