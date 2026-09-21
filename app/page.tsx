'use client';

import Link from 'next/link';
import { useState } from 'react';

const places = [
  ['central', 'CENTRAL', 'Ambitious / Overwhelmed', '22.2819° N  ·  114.1584° E'],
  ['mong-kok', 'MONG KOK', 'Energetic / Chaotic', '22.3193° N  ·  114.1694° E'],
  ['sham-shui-po', 'SHAM SHUI PO', 'Raw / Human', '22.3307° N  ·  114.1628° E'],
  ['west-kowloon', 'WEST KOWLOON', 'Inspired / Open', '22.3028° N  ·  114.1596° E'],
  ['kennedy-town', 'KENNEDY TOWN', 'Calm / Nostalgic', '22.2814° N  ·  114.1378° E'],
] as const;

export default function Home() {
  const [active, setActive] = useState<string | null>(null);
  return <main className={`art-home tone-${active ?? 'neutral'}`}>
    <div className="grain" aria-hidden="true" />
    <div className="coordinate coordinate-a">22.3193° N</div><div className="coordinate coordinate-b">114.1694° E</div>
    <header className="masthead"><div><span>CITY MOOD MAP</span><span>— HONG KONG</span></div><span>PLACES / PEOPLE / EMOTIONS</span></header>
    <div className="fine-line line-one" /><div className="fine-line line-two" />
    <section className="art-hero"><p className="micro">A LIVING PORTRAIT<br />OF A CITY IN TRANSITION</p><h1>How does<br />Hong Kong<br /><em>feel to you?</em></h1><p className="subtitle">Explore the city through<br />place, mood and memory.</p><p className="body-copy">An interactive digital experience<br />about how urban spaces shape emotion.</p></section>
    <nav className="places" aria-label="Choose a place">
      <p className="choose">Choose a place to begin.</p>
      {places.map(([slug, name, mood, coord], i) => <Link key={slug} href={`/place/${slug}`} className={`place place-${slug}`} onMouseEnter={() => setActive(slug)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(slug)} onBlur={() => setActive(null)}><span className="index">0{i + 1}</span><span className="place-name">{name}</span><span className="coord">{coord}</span><span className="place-mood">{active === slug ? mood : ''}</span><span className="enter">↗</span></Link>)}
    </nav>
    <footer className="foot"><span>HONG KONG / ALWAYS IN PROGRESS</span><a href="/mood" className="mood-home-link">SEE WHAT YOU KEPT ↗</a><span>SCROLL · HOVER · ENTER</span></footer>
  </main>;
}
