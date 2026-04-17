const fs = require("fs");
let c = fs.readFileSync("src/renderer/src/App.tsx", "utf8");

const oldPlaceholder = `{activeTab !== 'campaign' && activeTab !== 'generator' && activeTab !== 'history' && (
                <section className="flex-1 flex flex-col bg-white rounded border p-3 items-center jus`;

// Find the exact placeholder block
const startMarker = "activeTab !== 'campaign' && activeTab !== 'generator' && activeTab !== 'history'";
const startIdx = c.indexOf(startMarker);
if (startIdx === -1) { console.log("marker not found"); process.exit(1); }

// Find the closing )} of this block
let depth = 0;
let i = startIdx;
let inBlock = false;
while (i < c.length) {
  if (c[i] === '(' ) { depth++; inBlock = true; }
  if (c[i] === ')' && inBlock) { depth--; if (depth === 0) { i++; break; } }
  i++;
}
// skip the trailing )}
if (c[i] === '}') i++;

const before = c.substring(0, c.lastIndexOf('{', startIdx));
const after = c.substring(i);

const settingsTab = `{activeTab !== 'campaign' && activeTab !== 'generator' && activeTab !== 'history' && activeTab !== 'settings' && (
                <section className="flex-1 flex flex-col bg-white rounded border p-3 items-center justify-center text-gray-400">
                   <span className="font-black text-[10px] uppercase tracking-widest">{activeTab} MODULE</span>
                   <span className="text-[8px] mt-1 text-center">Coming soon.</span>
                </section>
              )}

              {activeTab === 'settings' && (
                <section className="flex-1 flex flex-col gap-1.5 min-w-0 overflow-hidden">
                  <div className="bg-white rounded border p-3 flex flex-col gap-3 shadow-sm overflow-y-auto flex-1">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Send Settings</span>

                    <div>
                      <span className="text-[7px] font-black text-gray-400 uppercase block mb-1.5">Speed Preset</span>
                      <div className="flex gap-1.5">
                        {(['safe','normal','fast'] as const).map(p => (
                          <button key={p} onClick={() => applyPreset(p)} className={\`flex-1 py-1.5 rounded text-[8px] font-black uppercase border transition-all \${speedPreset === p ? 'bg-[#00A884] text-white border-[#00A884]' : 'bg-gray-50 border-gray-200 text-gray-400'}\`}>
                            {p === 'safe' ? 'Safe' : p === 'normal' ? 'Normal' : 'Fast'}
                          </button>
                        ))}
                      </div>
                      <span className="text-[6px] text-gray-300 mt-1 block">{speedPreset === 'safe' ? '90-180s - Safest' : speedPreset === 'normal' ? '45-120s - Balanced' : '20-45s - Fastest'}</span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[7px] font-black text-gray-400 uppercase">Min Delay (sec)</span>
                        <input type="number" value={minDelay} onChange={e => setMinDelay(parseInt(e.target.value)||30)} className="w-full p-1.5 border rounded text-[9px] font-bold outline-none focus:border-[#00A884]" />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[7px] font-black text-gray-400 uppercase">Max Delay (sec)</span>
                        <input type="number" value={maxDelay} onChange={e => setMaxDelay(parseInt(e.target.value)||120)} className="w-full p-1.5 border rounded text-[9px] font-bold outline-none focus:border-[#00A884]" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-gray-400 uppercase">Daily Send Limit</span>
                      <div className="flex items-center gap-2">
                        <input type="number" value={dailyLimit} onChange={e => setDailyLimit(parseInt(e.target.value)||300)} className="flex-1 p-1.5 border rounded text-[9px] font-bold outline-none focus:border-[#00A884]" />
                        <span className="text-[7px] text-gray-400 shrink-0">msgs/day</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] font-black text-gray-400 uppercase">Schedule (send only between)</span>
                        <button onClick={() => setScheduleEnabled(!scheduleEnabled)} className={\`w-7 h-3.5 rounded-full relative \${scheduleEnabled ? 'bg-[#00A884]' : 'bg-gray-300'}\`}><div className={\`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform \${scheduleEnabled ? 'left-4' : 'left-0.5'}\`} /></button>
                      </div>
                      {scheduleEnabled && (
                        <div className="flex gap-2">
                          <input type="time" value={scheduleStart} onChange={e => setScheduleStart(e.target.value)} className="flex-1 p-1.5 border rounded text-[9px] font-bold outline-none focus:border-[#00A884]" />
                          <input type="time" value={scheduleEnd} onChange={e => setScheduleEnd(e.target.value)} className="flex-1 p-1.5 border rounded text-[9px] font-bold outline-none focus:border-[#00A884]" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] font-black text-gray-400 uppercase">Auto Breaks</span>
                        <button onClick={() => setBreakEnabled(!breakEnabled)} className={\`w-7 h-3.5 rounded-full relative \${breakEnabled ? 'bg-[#00A884]' : 'bg-gray-300'}\`}><div className={\`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform \${breakEnabled ? 'left-4' : 'left-0.5'}\`} /></button>
                      </div>
                      {breakEnabled && (
                        <div className="flex gap-2">
                          <div className="flex-1"><span className="text-[6px] text-gray-400">Every N msgs</span><input type="number" value={breakEvery} onChange={e => setBreakEvery(parseInt(e.target.value)||25)} className="w-full p-1.5 border rounded text-[9px] font-bold outline-none focus:border-[#00A884]" /></div>
                          <div className="flex-1"><span className="text-[6px] text-gray-400">Break (min)</span><input type="number" value={breakDuration} onChange={e => setBreakDuration(parseInt(e.target.value)||10)} className="w-full p-1.5 border rounded text-[9px] font-bold outline-none focus:border-[#00A884]" /></div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[7px] font-black text-gray-400 uppercase">Shuffle Contact Order</span>
                      <button onClick={() => setShuffleContacts(!shuffleContacts)} className={\`w-7 h-3.5 rounded-full relative \${shuffleContacts ? 'bg-[#00A884]' : 'bg-gray-300'}\`}><div className={\`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform \${shuffleContacts ? 'left-4' : 'left-0.5'}\`} /></button>
                    </div>

                    <div className="border-t pt-3 flex flex-col gap-1">
                      <span className="font-black text-[9px] text-gray-500 uppercase">Anti-Ban Tips</span>
                      <ul className="text-[7px] text-gray-400 space-y-1 list-disc pl-3">
                        <li>Use numbers at least 3 months old</li>
                        <li>Start with 50/day, increase gradually</li>
                        <li>Keep Smart Twist ON always</li>
                        <li>Enable auto breaks</li>
                        <li>Use schedule to send during business hours only</li>
                      </ul>
                    </div>
                  </div>
                </section>
              )}`;

const fullOld = c.substring(c.lastIndexOf('{', startIdx), i);
c = c.replace(fullOld, settingsTab);
fs.writeFileSync("src/renderer/src/App.tsx", c);
console.log("Settings tab added, has speedPreset:", c.includes("speedPreset"));
