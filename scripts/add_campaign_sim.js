const fs = require("fs");
let c = fs.readFileSync("src/renderer/src/App.tsx", "utf8");

const oldSend = `        let finalMessage = messageTemplate.replace('{name}', contact.name || '')
        if (isSmartTwistEnabled) finalMessage = twistMessage(finalMessage, 0.3)
        await api.sendMessage({ phone: contact.phone, message: finalMessage })`;

const newSend = `        let finalMessage = messageTemplate.replace('{name}', contact.name || '')
        if (isSmartTwistEnabled) finalMessage = twistMessage(finalMessage, 0.3)

        // Show typing simulation in UI
        setSimPhone(contact.phone.replace(/\\D/g, ''))
        setSimState('typing')
        setSimTypedText('')
        const typingDuration = Math.min(Math.max(finalMessage.length * 40, 1500), 6000)
        const charInterval = typingDuration / finalMessage.length
        for (let ci = 0; ci <= finalMessage.length; ci++) {
          if (!isSendingRef.current) break
          await new Promise(r => setTimeout(r, charInterval))
          setSimTypedText(finalMessage.slice(0, ci))
        }
        setSimState('sending')
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500))

        await api.sendMessage({ phone: contact.phone, message: finalMessage })
        setSimState('sent')
        await new Promise(r => setTimeout(r, 1500))
        setSimState('idle')
        setSimTypedText('')`;

if (c.includes(oldSend)) {
  c = c.replace(oldSend, newSend);
  fs.writeFileSync("src/renderer/src/App.tsx", c);
  console.log("Campaign simulation added");
} else {
  console.log("Pattern not found, trying alternate...");
  // Try with different whitespace
  const lines = c.split("\n");
  const idx = lines.findIndex(l => l.includes("await api.sendMessage") && l.includes("contact.phone"));
  console.log("sendMessage line:", idx, lines[idx]);
}
