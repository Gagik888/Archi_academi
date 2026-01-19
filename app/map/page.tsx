// ... (все импорты прежние)

export default function MapPage() {
  // ... (все стейты прежние)

  const loadProfile = async () => {
    const ip = localStorage.getItem("archi_user_ip");
    if (!ip) { window.location.href = "/login"; return; }
    
    const { data } = await supabase.from("profiles").select("*").eq("ip_address", ip).single();
    if (data) {
      setUser(data);
      setCoins(data.coins || 0);
      setActiveSkin(data.active_skin || "green");
      setUnlockedSkins(data.unlocked_skins || ["green"]);
      // Используем структуру курса из базы
      if (data.course_structure) setLeaders(data.course_structure); 
    }
  };

  // Красивая кнопка в магазине
  const buyOrSelect = async (skin: any) => {
    if (unlockedSkins.includes(skin.id)) {
      await supabase.from('profiles').update({ active_skin: skin.id }).eq('ip_address', user.ip_address);
      setActiveSkin(skin.id);
    } else if (coins >= skin.price) {
      const newCoins = coins - skin.price;
      const newSkins = [...unlockedSkins, skin.id];
      await supabase.from('profiles').update({ coins: newCoins, unlocked_skins: newSkins, active_skin: skin.id }).eq('ip_address', user.ip_address);
      setCoins(newCoins); setUnlockedSkins(newSkins); setActiveSkin(skin.id);
    }
  };

  const skinColor = SKINS.find(s => s.id === activeSkin)?.color || '#00ff00';

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh' }}>
      {/* HEADER с монеткой png */}
      <header style={{ position: 'fixed', top: 0, width: '100%', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${skinColor}33`, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <img src={`/archi-${activeSkin}.png`} style={{ width: '50px', filter: `drop-shadow(0 0 10px ${skinColor})` }} />
           <h2 style={{ color: skinColor, margin: 0, letterSpacing: '2px' }}>ARCHI</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#111', padding: '10px 20px', borderRadius: '15px', border: `1px solid ${skinColor}44`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/coin.png" style={{ width: '22px' }} />
            <span style={{ fontWeight: 'bold', color: skinColor }}>{coins}</span>
          </div>
          <button onClick={() => setShowShop(true)} style={{ background: skinColor, color: '#000', border: 'none', padding: '10px 20px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>МАГАЗИН</button>
          <button onClick={() => window.location.href='/leaderboard'} style={{ background: '#111', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><Trophy color="#ffd700" /></button>
        </div>
      </header>

      {/* КАРТА УРОВНЕЙ */}
      <main style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '120px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '50px' }}>{user.current_course}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(user.course_structure || ["Загрузка путей..."]).map((lvl: any, i: number) => (
            <div key={i} onClick={() => { /* логика открытия урока */ }} style={{ background: '#0d0d0d', padding: '30px', borderRadius: '25px', border: '1px solid #222', borderLeft: `8px solid ${skinColor}`, cursor: 'pointer', transition: '0.3s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#444', fontWeight: 'bold' }}>LEVEL {i+1}</span>
                <h3 style={{ margin: '5px 0 0 0' }}>{lvl}</h3>
              </div>
              <ArrowRight color={skinColor} />
            </div>
          ))}
        </div>
      </main>

      {/* МОДАЛКА МАГАЗИНА */}
      {showShop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#0d0d0d', padding: '40px', borderRadius: '35px', border: `1px solid ${skinColor}33`, width: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h2 style={{ margin: 0 }}>SKIN SHOP</h2>
              <X onClick={() => setShowShop(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {SKINS.map(s => (
                <div key={s.id} style={{ background: '#070707', padding: '20px', borderRadius: '25px', border: activeSkin === s.id ? `2px solid ${s.color}` : '1px solid #222', textAlign: 'center' }}>
                  <img src={`/archi-${s.id}.png`} style={{ width: '60px', marginBottom: '15px' }} />
                  <button onClick={() => buyOrSelect(s)} style={{ width: '100%', background: unlockedSkins.includes(s.id) ? s.color : '#222', color: unlockedSkins.includes(s.id) ? '#000' : '#fff', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    {unlockedSkins.includes(s.id) ? "ВЫБРАТЬ" : <>{s.price} <img src="/coin.png" style={{ width: '16px' }} /></>}
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
