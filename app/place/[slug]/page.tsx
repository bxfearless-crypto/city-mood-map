'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const fragments = ['08:42', 'NEXT MEETING', '47 FLOORS', '3 UNREAD MESSAGES', 'LUNCH?', 'DEADLINE', 'ON MY WAY', 'RUNNING LATE', 'CAN YOU CALL?', 'PENDING', 'NO SIGNAL', 'KEEP GOING', 'IN TRANSIT', 'FOLLOW UP', '10:15', 'DID YOU SEND IT?', 'ONE MORE THING', 'STILL WORKING', 'REPLY ALL', 'BREATHE'];
const fragmentPositions = ['3% 7%', '16% 88%', '29% 21%', '44% 78%', '57% 4%', '70% 36%', '84% 82%', '10% 42%', '22% -5%', '34% 65%', '50% 44%', '63% 16%', '77% 54%', '91% 25%', '2% 65%', '40% 9%', '55% 76%', '72% 60%', '87% 72%', '96% 60%'];
const bottomFragments = ['LAST TRAIN', 'STILL ONLINE', '09:58', 'NO BREAK', 'SEND IT', 'KEEP WALKING', 'OUT OF OFFICE?', 'ONE LAST CALL'];
const midFragments = ['09:17', 'INBOX 47', 'CAN YOU HEAR ME?', 'RUNNING BETWEEN FLOORS', 'NO TIME TO THINK', 'KEEP THE PACE', 'MISSED CALL', 'TAB 06 OPEN', 'WHERE ARE YOU?', 'DECK 31', 'REPLY ASAP', 'STILL IN TRANSIT', 'MEETING MOVED', 'DO NOT DISTURB'];
const detailFrames = Array.from({ length: 10 }, (_, index) => `/central-detail-${String(index + 1).padStart(2, '0')}.png`);
const commuteFrames = ['/optimized/central-commute-04.jpg', '/optimized/central-commute-05.jpg', '/optimized/central-commute-06.jpg', '/optimized/central-commute-07.jpg'];
const pressureFrames = ['/optimized/central-pressure-1.jpg', '/optimized/central-pressure-2.jpg', '/optimized/central-pressure-3.jpg'];
const allCentralImages = ['/optimized/central-arrival.jpg', '/optimized/central-acceleration.jpg', '/optimized/central-pause.jpg', '/optimized/central-glass.jpg', '/optimized/central-vertical-movement.jpg', '/optimized/central-atrium.jpg', ...detailFrames, ...commuteFrames, ...pressureFrames];

export default function CentralPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? 'central';
  if (slug !== 'central') {
    const name = slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    return <main className="place-placeholder"><Link href="/">← CITY MOOD MAP</Link><p>PLACE / {slug.toUpperCase()}</p><h1>{name}</h1><em>This place is waiting to be explored.</em></main>;
  }
  const [choice, setChoice] = useState<'moving' | 'slow' | null>(null);
  const [pressure, setPressure] = useState(0);
  useEffect(() => { const saved = window.localStorage.getItem('central-mood-choice'); if (saved === 'moving' || saved === 'slow') setChoice(saved); }, []);
  useEffect(() => { const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setPressure(max > 0 ? Math.min(1, window.scrollY / max) : 0); }; onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  const choose = (value: 'moving' | 'slow') => { setChoice(value); window.localStorage.setItem('central-mood-choice', value); };
  return <main className={`central-experience pressure-${pressure > .62 ? 'high' : pressure > .3 ? 'mid' : 'low'} ${choice ? `choice-${choice}` : ''}`} style={{ '--pressure': pressure } as React.CSSProperties}>
    <div className="central-grain" style={{ opacity: 0.018, filter: 'grayscale(1) blur(2px) contrast(1.1)', mixBlendMode: 'soft-light' }} aria-hidden="true" /><div className="central-architecture" style={{ opacity: 0.18 }} aria-hidden="true" />
    <header className="central-nav"><Link href="/">CITY MOOD MAP / HONG KONG</Link><span>CENTRAL / 01</span><span>SCROLL TO EXPERIENCE</span></header>
    <section className="central-arrival editorial-arrival text-only-arrival"><div className="arrival-meta"><span>HONG KONG / 01</span><span>22.2819° N<br />114.1582° E</span></div><p className="central-kicker">SECTION 01 / ARRIVAL</p><h1>CENTRAL</h1><p className="central-feeling">ambitious / overwhelmed</p><p className="central-line">Always moving.<br /><em>Always becoming.</em></p><span className="arrival-mark">↓</span></section>
    <section className="central-acceleration editorial-acceleration"><p className="central-kicker">SECTION 02 / ACCELERATION</p><div className="accel-gallery">{allCentralImages.map((source, index) => <figure key={source} className={`gallery-frame gallery-frame-${index + 1}`}><img src={source} alt="" /></figure>)}</div><div className="fragments" aria-label="The pace of Central">{fragments.map((fragment, index) => { const [top, left] = fragmentPositions[index].split(' '); return <span key={fragment} className={`fragment fragment-${index + 1}`} style={{ top, left }}>{fragment}</span>; })}</div><div className="mid-fragments" aria-label="Mid-section pressure fragments">{midFragments.map((fragment, index) => <span key={fragment} className={`mid-fragment mid-fragment-${index + 1}`}>{fragment}</span>)}</div><div className="bottom-fragments" aria-label="More pressure fragments">{bottomFragments.map((fragment, index) => <span key={fragment} className={`bottom-fragment bottom-fragment-${index + 1}`}>{fragment}</span>)}</div><p className="acceleration-copy">The city asks for more.<br /><em>It rarely asks you to stop.</em></p></section>
    <section className="central-pause editorial-pause"><p className="central-kicker">SECTION 03 / PAUSE</p><div className="pause-question">When everything moves fast,<br /><em>where do you find space to breathe?</em></div><div className="pause-choices"><button className={`choice-moving ${choice === 'moving' ? 'selected' : ''}`} onClick={() => choose('moving')}>I keep moving.</button><button className={`choice-slow ${choice === 'slow' ? 'selected' : ''}`} onClick={() => choose('slow')}>I slow down.</button></div>{choice && <p className="choice-note">YOUR HONG KONG MOOD / SAVED</p>}</section>
    <footer className="central-footer"><Link href="/">← RETURN TO CITY MOOD MAP</Link><span>HONG KONG / CENTRAL</span><span>01—03</span></footer>
  </main>;
}
