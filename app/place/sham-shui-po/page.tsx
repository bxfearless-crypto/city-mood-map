'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const fragments = [
  ['/sham-shui-po-shutter.png','OBJECT 03','Someone repaired this\ninstead of replacing it.'],
  ['/sham-shui-po-market.png','TEXTURE 07','A city can feel old\nwithout feeling finished.'],
  ['/sham-shui-po-electronics.png','FOUND / SSP','Small shops remember\nwhat towers forget.'],
  ['/sham-shui-po-stairs.png','ARCHIVE / 03','The handrail keeps\nthe shape of every hand.'],
  ['/sham-shui-po-window.png','MATERIAL 11','Morning enters\nthrough what remains.'],
];
type Memory = 'objects'|'people'|'imperfection'|'memory';

export default function ShamShuiPoPage() {
  const [dragging, setDragging] = useState<number|null>(null);
  const [memory, setMemory] = useState<Memory|null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: -1000, y: -1000 });
  const frame = useRef<number | null>(null);
  useEffect(() => { const board = boardRef.current; if (!board) return; const move = (event: PointerEvent) => { pointer.current = { x: event.clientX, y: event.clientY }; if (frame.current) return; frame.current = requestAnimationFrame(() => { frame.current = null; board.querySelectorAll<HTMLElement>('.ssp-fragment').forEach((card) => { const rect = card.getBoundingClientRect(); const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2; const distance = Math.hypot(pointer.current.x - cx, pointer.current.y - cy); const proximity = Math.max(0, Math.min(1, 1 - (distance - Math.max(rect.width, rect.height) / 2) / 180)); const x = ((pointer.current.x - cx) / Math.max(rect.width, 1)) * proximity * 5; const y = ((pointer.current.y - cy) / Math.max(rect.height, 1)) * proximity * 5; card.style.setProperty('--proximity', proximity.toFixed(3)); card.style.setProperty('--px', `${x.toFixed(2)}px`); card.style.setProperty('--py', `${y.toFixed(2)}px`); card.style.setProperty('--reveal-x', `${((pointer.current.x - rect.left) / rect.width * 100).toFixed(1)}%`); card.style.setProperty('--reveal-y', `${((pointer.current.y - rect.top) / rect.height * 100).toFixed(1)}%`); }); }); }; window.addEventListener('pointermove', move, { passive: true }); return () => { window.removeEventListener('pointermove', move); if (frame.current) cancelAnimationFrame(frame.current); }; }, []);
  return <main className="ssp-experience">
    <div className="ssp-paper-noise" aria-hidden="true" /><div className="ssp-moss-border" aria-hidden="true" />
    <header className="ssp-nav"><Link href="/">CITY MOOD MAP / HONG KONG</Link><span>SHAM SHUI PO / 03</span><span>URBAN ARCHIVE</span></header>
    <section className="ssp-entry"><div className="ssp-coords">HONG KONG / 03<br/><span>22.3302° N&nbsp;&nbsp;114.1622° E</span></div><p className="ssp-label">SECTION 01 / ARCHIVE ENTRY</p><h1>SHAM<br/>SHUI PO</h1><p className="ssp-feeling">raw / human</p><p className="ssp-intro">The city feels closest<br/><em>when it feels lived in.</em></p><span className="ssp-stamp">FOUND / 03<br/>KEEP / LOOKING</span></section>
    <section className="ssp-fragments"><p className="ssp-label">SECTION 02 / CITY FRAGMENTS</p><p className="ssp-note">a few things<br/><em>left behind</em></p><div className="ssp-board" ref={boardRef} onPointerLeave={() => boardRef.current?.querySelectorAll<HTMLElement>('.ssp-fragment').forEach(card => { card.style.setProperty('--proximity','0'); })}>{fragments.map(([src,label,text],i)=><article key={src} className={`ssp-fragment ssp-fragment-${i+1} ssp-kind-${i===0?'sign':i===1?'fabric':i===2?'object':i===3?'texture':'human'} ${dragging===i?'is-dragging':''}`} draggable onDragStart={()=>setDragging(i)} onDragEnd={()=>setDragging(null)}><div className="ssp-tape"/><img src={src} alt=""/><span className="ssp-hidden-type">{i===0?'STILL HERE':i===2?'OBJECT / 04  ·  USED  ·  REPAIRED  ·  KEPT':i===1?'ARCHIVE / 03':''}</span><div className="ssp-annotation" aria-hidden="true">OBJECT / 04<br/>USED<br/>REPAIRED<br/>KEPT</div><div className="ssp-fragment-meta"><span>{label}</span><b>03 / 05</b></div><button className="ssp-reveal" onClick={()=>setDragging(dragging===i?null:i)}>{dragging===i?'CLOSE MEMORY':'DRAG TO DISCOVER'}</button>{dragging===i&&<p className="ssp-hidden-memory">{text.split('\n').map(line=><span key={line}>{line}<br/></span>)}</p>}</article>)}</div></section>
    <section className="ssp-shelf"><p className="ssp-label">SECTION 04 / MEMORY SHELF</p><div className="ssp-shelf-question">What makes a place<br/><em>feel human to you?</em></div><div className="ssp-memory-list">{([['objects','OBJECTS'],['people','PEOPLE'],['imperfection','IMPERFECTION'],['memory','MEMORY']] as [Memory,string][]).map(([value,label],i)=><button key={value} className={memory===value?'is-selected':''} onClick={()=>{setMemory(value);localStorage.setItem('sham-shui-po-memory',value)}}><small>0{i+1}</small>{label}</button>)}</div>{memory&&<p className="ssp-saved">YOUR HONG KONG MOOD / SAVED</p>}</section>
    <footer className="ssp-footer"><Link href="/">← RETURN TO CITY MOOD MAP</Link><span>HONG KONG / SHAM SHUI PO</span><span>03—04</span></footer>
  </main>;
}
