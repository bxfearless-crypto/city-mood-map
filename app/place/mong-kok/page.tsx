'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const fragments = ['18:47','EXIT E2','OPEN LATE','NEXT TRAIN','ARGYLE STREET →','CROSS NOW','WAIT','KEEP MOVING','02 / MK','NO ROOM','TURN LEFT','STILL OPEN','FOLLOW THE CROWD','LAST BUS'];
const senses = ['VOICES','TRAFFIC','MUSIC','FOOTSTEPS','SIGNS'] as const;
type Choice = 'energy'|'people'|'noise'|'details';

export default function MongKokPage() {
  const [active, setActive] = useState<string|null>(null);
  const [choice, setChoice] = useState<Choice|null>(null);
  const [density, setDensity] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  useEffect(() => { const saved = localStorage.getItem('mong-kok-mood'); if (saved) setChoice(saved as Choice); const onScroll = () => setDensity(Math.min(1, scrollY / (document.documentElement.scrollHeight - innerHeight || 1))); onScroll(); addEventListener('scroll', onScroll, { passive:true }); return () => removeEventListener('scroll', onScroll); }, []);
  const choose = (value: Choice) => { setChoice(value); localStorage.setItem('mong-kok-mood', value); };
  const audioPath = (sense: string) => `/audio/mong-kok/${sense.toLowerCase()}.wav`;
  const stopSound = () => { if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; const audio = audioRef.current; if (!audio) return; audio.pause(); audio.currentTime = 0; audio.volume = 0; audioRef.current = null; };
  const fadeIn = (audio: HTMLAudioElement) => { if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current); let volume = 0; audio.volume = 0; fadeTimerRef.current = window.setInterval(() => { volume = Math.min(.24, volume + .04); audio.volume = volume; if (volume >= .24 && fadeTimerRef.current) { window.clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; } }, 35); };
  const playSound = (sense: string) => { if (!soundEnabled || !soundOn) return; stopSound(); const audio = new Audio(audioPath(sense)); audio.preload = 'auto'; audio.loop = true; audio.volume = 0; audioRef.current = audio; audio.play().then(() => fadeIn(audio)).catch(() => { audioRef.current = null; }); };
  const enableSound = () => { setSoundEnabled(true); setSoundOn(true); };
  return <main className={`mong-kok-experience mk-${active?.toLowerCase() ?? 'idle'} mk-density-${density > .58 ? 'high' : density > .25 ? 'mid' : 'low'}`}>
    {!soundEnabled && <div className="mk-sound-gate"><p>SOUND IS PART OF THE STREET</p><button onClick={enableSound}>ENTER WITH SOUND</button><button className="mk-skip-sound" onClick={() => setSoundEnabled(true)}>CONTINUE SILENTLY</button></div>}
    <div className="mk-grain" aria-hidden="true" />
    <header className="mk-nav"><Link href="/">CITY MOOD MAP / HONG KONG</Link><span>MONG KOK / 02</span><span>FOLLOW THE NOISE ↓</span><button className="mk-sound-toggle" onClick={() => { setSoundOn(!soundOn); if (soundOn) stopSound(); }}>SOUND {soundOn && soundEnabled ? 'ON' : 'OFF'}</button></header>
    <section className="mk-arrival"><div className="mk-coordinates">HONG KONG / 02<br/><span>22.3193° N&nbsp;&nbsp;114.1694° E</span></div><p className="mk-section-label">SECTION 01 / ENTER THE DENSITY</p><h1><span>MONG</span><span>KOK</span></h1><p className="mk-feeling">energetic / chaotic</p><p className="mk-intro">Too much, too fast —<br/><em>and somehow alive.</em></p><div className="mk-sign-strip" aria-hidden="true"><i>OPEN</i><b>24</b><i>LATE</i><b>出口</b></div></section>
    <section className="mk-overload"><p className="mk-section-label">SECTION 02 / INFORMATION OVERLOAD</p><div className="mk-grid-lines" aria-hidden="true"/><div className="mk-fragments">{fragments.map((item,i) => <span key={item} className={`mk-fragment mk-fragment-${i+1}`}>{item}</span>)}</div><p className="mk-overload-copy">The street is not asking<br/><em>for your attention.</em><br/>It already has it.</p><figure className="mk-image mk-image-a"><img src="/optimized/mong-kok-signage.jpg" alt="Abstract layers of Mong Kok signage"/><span>旺角 / 18:47</span></figure><figure className="mk-image mk-image-b"><img src="/optimized/mong-kok-crowd.jpg" alt="Abstract crowd movement in Mong Kok"/><span>KEEP MOVING</span></figure></section>
    <section className="mk-noise"><p className="mk-section-label">SECTION 03 / FOLLOW THE NOISE</p><div className="mk-noise-stage"><p className="mk-noise-instruction">MOVE THROUGH THE CITY<br/><em>hover a frequency</em></p>{senses.map(s => <button key={s} className={`mk-sense mk-sense-${s.toLowerCase()}`} onMouseEnter={() => { setActive(s); playSound(s); }} onMouseLeave={() => { setActive(null); stopSound(); }} onFocus={() => { setActive(s); playSound(s); }} onBlur={() => { setActive(null); stopSound(); }}>{s}</button>)}</div><div className="mk-trails" aria-hidden="true"/></section>
    <section className="mk-human"><p className="mk-section-label">SECTION 04 / HUMAN MOMENT</p><div className="mk-human-photo"><img src="/optimized/mong-kok-human-detail.jpg" alt="Abstract human detail in a Mong Kok street"/><span>ONE PERSON / MANY SIGNALS</span></div><div className="mk-question">In a city this loud,<br/><em>what do you notice first?</em></div><div className="mk-choices">{([['energy','The energy'],['people','The people'],['noise','The noise'],['details','The details']] as [Choice,string][]).map(([v,label],i) => <button key={v} className={choice===v?'is-selected':''} onClick={() => choose(v)}><small>0{i+1}</small>{label}</button>)}</div>{choice && <p className="mk-saved">YOUR HONG KONG MOOD / SAVED</p>}</section>
    <footer className="mk-footer"><Link href="/">← RETURN TO CITY MOOD MAP</Link><span>HONG KONG / MONG KOK</span><span>02—04</span></footer>
  </main>;
}
