const fs = require('fs');
const current = fs.readFileSync('src/renderer/src/App.tsx', 'utf8');
const jsx = 
  return (
    <div className={\lex flex-col h-screen \ \ font-sans text-[9px] overflow-hidden\}>
      <header className="shrink-0 z-30 shadow-sm">
        <div className="h-9 bg-[#00A884] flex items-center px-2 justify-between">
          <div className="bg-white px-1 py-0.5 rounded shadow-sm"><AppLogo /></div>
          <div className="flex items-center gap-1.5">
            {estimatedTime && isSending && <span className="text-white/70 text-[7px] font-black">{estimatedTime}</span>}
            <div className="px-1.5 py-0.5 rounded-full flex items-center gap-1 bg-white/20 text-white font-black text-[7px] uppercase">
              <div className={\w-1 h-1 rounded-full \\} />
              {status.isReady ? 'LIVE' : 'OFF'}
            </div>
            {!status.isReady && <button onClick={handleConnect} className="bg-white text-[#00A884] px-2 py-0.5 rounded font-black text-[8px] active:scale-95 shadow-sm">LINK</button>}
            {license && !license.trialExpired && <button onClick={() => setIsActivateModalOpen(true)} className="bg-white/20 text-white px-2 py-0.5 rounded font-black text-[8px]">KEY</button>}
            <button onClick={() => setDarkMode(!dm)} className="text-white/70 hover:text-white p-1">{dm ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}</button>
            <button onClick={async () => { await api()?.logout(); setStatus({ isReady: false, isAuthenticated: false, qrCode: null }) }} className="text-white/70 hover:text-red-300 p-1"><LogOut className="w-3 h-3" /></button>
          </div>
        </div>
        {license && !license.trialExpired && license.hoursLeft > 0 && (
          <div className="bg-yellow-400 text-black px-2 py-0.5 flex items-center justify-between text-[7px] font-black">
            <span>TRIAL: {Math.floor(license.hoursLeft)}h {Math.floor((license.hoursLeft % 1) * 60)}m remaining</span>
            <span className="opacity-60 uppercase">Enter serial key to unlock</span>
          </div>
        )}
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className={\w-8 \ border-r \ flex flex-col items-center py-2 gap-3 shrink-0 z-20\}>
          <button onClick={() => setActiveTab('campaign')} className={\p-1 rounded \\}><LayoutDashboard className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('generator')} className={\p-1 rounded \\}><UserPlus className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('history')} className={\p-1 rounded \\}><History className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('templates')} className={\p-1 rounded \\}><BookOpen className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('blacklist')} className={\p-1 rounded \\}><Ban className="w-4 h-4" /></button>
          <div className="mt-auto flex flex-col items-center gap-3">
            <button onClick={() => setActiveTab('settings')} className={\p-1 rounded \\}><Settings className="w-4 h-4" /></button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 flex overflow-hidden p-1.5 gap-1.5">
;
fs.writeFileSync('src/renderer/src/App.tsx', current + jsx);
console.log('done');
