const fs = require("fs");
let c = fs.readFileSync("src/renderer/src/App.tsx", "utf8");
const marker = "{/* Contact Queue List */}";
const replacement = `{/* Typing Simulation Preview */}
                  {simState !== "idle" && (
                    <div className="bg-white rounded border shadow-sm shrink-0 overflow-hidden mb-1.5">
                      <div className="px-1.5 py-0.5 bg-[#075E54] border-b flex items-center justify-between">
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">WHATSAPP PREVIEW</span>
                        <span className="text-[7px] font-black text-[#25D366]">+{simPhone}</span>
                      </div>
                      <div className="p-2 bg-[#ECE5DD]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-[7px] text-gray-500 font-black uppercase mb-1">
                            {simState === "typing" && <><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" /><span>Typing message...</span></>}
                            {simState === "sending" && <><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" /><span>Clicking send button...</span></>}
                            {simState === "sent" && <><span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block" /><span>Message delivered!</span></>}
                          </div>
                          <div className="bg-[#DCF8C6] rounded-lg rounded-br-none px-2 py-1.5 max-w-[85%] self-end shadow-sm relative">
                            <p className="text-[9px] text-gray-800 font-medium whitespace-pre-wrap break-words min-h-[12px]">
                              {simTypedText}{simState === "typing" && <span className="inline-block w-0.5 h-3 bg-gray-700 animate-pulse ml-0.5 align-middle" />}
                            </p>
                            <div className="flex items-center justify-end gap-0.5 mt-0.5">
                              <span className="text-[6px] text-gray-400">{new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                              {simState === "sent" && <CheckCheck className="w-2.5 h-2.5 text-[#34B7F1]" />}
                              {simState === "sending" && <CheckCheck className="w-2.5 h-2.5 text-gray-400" />}
                            </div>
                          </div>
                          {simState === "sending" && (
                            <div className="flex justify-end mt-1">
                              <div className="bg-[#00A884] text-white text-[7px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-bounce">
                                <span>SEND</span><span>→</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Queue List */}`;
c = c.replace(marker, replacement);
fs.writeFileSync("src/renderer/src/App.tsx", c);
console.log("done, has sim:", c.includes("WHATSAPP PREVIEW"));
