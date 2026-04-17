const fs = require("fs");
let c = fs.readFileSync("src/renderer/src/App.tsx", "utf8");

const insertAfter = "  const [isSendingQuick, setIsSendingQuick] = useState(false)";
const newStates = `
  const [speedPreset, setSpeedPreset] = useState('normal')
  const [minDelay, setMinDelay] = useState(45)
  const [maxDelay, setMaxDelay] = useState(120)
  const [dailyLimit, setDailyLimit] = useState(300)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleStart, setScheduleStart] = useState('09:00')
  const [scheduleEnd, setScheduleEnd] = useState('17:00')
  const [breakEnabled, setBreakEnabled] = useState(true)
  const [breakEvery, setBreakEvery] = useState(25)
  const [breakDuration, setBreakDuration] = useState(10)
  const [shuffleContacts, setShuffleContacts] = useState(false)

  const applyPreset = (preset: string) => {
    setSpeedPreset(preset)
    if (preset === 'safe') { setMinDelay(90); setMaxDelay(180) }
    else if (preset === 'normal') { setMinDelay(45); setMaxDelay(120) }
    else { setMinDelay(20); setMaxDelay(45) }
  }`;

c = c.replace(insertAfter, insertAfter + newStates);
fs.writeFileSync("src/renderer/src/App.tsx", c);
console.log("States added, has speedPreset:", c.includes("const [speedPreset"));
