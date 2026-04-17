const fs = require('fs');
let c = fs.readFileSync('src/renderer/src/App.tsx', 'utf8');
const lines = c.split('\n');
const idx = lines.findIndex(l => l.includes('await api.sendMessage') && l.includes('contact.phone'));
if (idx === -1) { console.log('not found'); process.exit(1); }
const before = lines.slice(0, idx);
const after = lines.slice(idx);
const sim = [
  '',
  '        // Typing simulation',
  '        setSimPhone(contact.phone)',
  '        setSimState("typing")',
  '        setSimTypedText("")',
  '        const tMs = Math.min(Math.max(finalMessage.length * 40, 1500), 6000)',
  '        const cMs = tMs / finalMessage.length',
  '        for (let ci = 0; ci <= finalMessage.length; ci++) {',
  '          if (!isSendingRef.current) break',
  '          await new Promise(r => setTimeout(r, cMs))',
  '          setSimTypedText(finalMessage.slice(0, ci))',
  '        }',
  '        setSimState("sending")',
  '        await new Promise(r => setTimeout(r, 600))',
  ''
];
const sendLine = after[0];
const afterSend = after.slice(1);
const sent = [
  '        setSimState("sent")',
  '        await new Promise(r => setTimeout(r, 1500))',
  '        setSimState("idle")',
  '        setSimTypedText("")'
];
const result = [...before, ...sim, sendLine, ...sent, ...afterSend];
fs.writeFileSync('src/renderer/src/App.tsx', result.join('\n'));
console.log('done, lines:', result.length);
