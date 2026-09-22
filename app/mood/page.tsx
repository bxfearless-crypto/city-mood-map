'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type PageKey = 'cover' | 'intro' | 'central' | 'mong' | 'sham' | 'west' | 'kennedy' | 'keep' | 'final';

const pages: PageKey[] = ['cover', 'intro', 'central', 'mong', 'sham', 'west', 'kennedy', 'keep', 'final'];

// Temporary development preview only. This does not modify the saved Central choice.
const PREVIEW_CENTRAL_KEEP_MOVING = false;
const PREVIEW_MONG_ENERGY = false;
const PREVIEW_MONG_PEOPLE = false;
const PREVIEW_MONG_NOISE = false;
const PREVIEW_MONG_DETAILS = false;
const PREVIEW_SHAM_OBJECTS = false;
const PREVIEW_SHAM_PEOPLE = false;
const PREVIEW_SHAM_IMPERFECTION = false;
const PREVIEW_SHAM_MEMORY = false;
const PREVIEW_WEST_FORM = false;
const PREVIEW_WEST_LIGHT = false;
const PREVIEW_WEST_DISTANCE = false;
const PREVIEW_WEST_POSSIBILITY = false;

const read = (key: string) => {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(key) || '';
};

const choiceLabel: Record<string, string> = {
  moving: 'KEEP MOVING', slow: 'SLOW DOWN', energy: 'THE ENERGY', people: 'THE PEOPLE',
  noise: 'THE NOISE', details: 'THE DETAILS', objects: 'OBJECTS', imperfection: 'IMPERFECTION',
  memory: 'MEMORY', form: 'FORM', light: 'LIGHT', distance: 'DISTANCE', possibility: 'POSSIBILITY',
  sea: 'THE SEA', silence: 'THE SILENCE', feeling: 'THE FEELING',
};

const MONG_KOK_CHOICES = ['energy', 'people', 'noise', 'details'] as const;
type MongKokChoice = typeof MONG_KOK_CHOICES[number];
const normalizeMongKokChoice = (value: string): MongKokChoice => (
  MONG_KOK_CHOICES.includes(value as MongKokChoice) ? value as MongKokChoice : 'details'
);

type AxisScore = readonly [number, number, number];
const choiceAxes: Record<string, AxisScore> = {
  moving: [1, -1, 1], slow: [-1, 1, -1], energy: [1, -1, -1], people: [1, 1, -1], noise: [1, 1, 1], details: [-1, 1, 1],
  objects: [-1, 1, 1], imperfection: [-1, 1, -1], memory: [-1, -1, -1], form: [-1, 1, 1], light: [1, 1, -1], distance: [-1, -1, -1], possibility: [1, -1, 1],
  sea: [1, -1, -1], silence: [-1, -1, -1], feeling: [-1, 1, -1],
};

const resultProfiles: Record<string, { title: string; sentence: string; conclusionLead: string; conclusion: string }> = {
  'KINETIC|CLOSE|STRUCTURE': { title: 'THE PATTERN HUNTER', sentence: 'You read Hong Kong through signals, structures, and details that keep the city in motion.', conclusionLead: 'YOUR HONG KONG IS A SYSTEM OF CLUES.', conclusion: 'You notice how the city works before you notice how it looks. Signs, objects, repetitions and small structures become a language — one that reveals order inside apparent chaos.' },
  'KINETIC|CLOSE|ATMOSPHERE': { title: 'THE CITY LISTENER', sentence: 'You move through Hong Kong by catching voices, light, and fleeting human moments.', conclusionLead: 'YOUR HONG KONG IS ALIVE BETWEEN PEOPLE.', conclusion: 'You remember the city through passing encounters rather than fixed landmarks. A voice, a gesture, a reflection or a moment in the crowd becomes part of how you understand a place.' },
  'KINETIC|WIDE|STRUCTURE': { title: 'THE URBAN CURRENT', sentence: 'You understand the city through movement, scale, and the systems that carry you forward.', conclusionLead: 'YOUR HONG KONG IS ALWAYS IN MOTION.', conclusion: 'You are drawn to the forces that keep the city moving — density, circulation, architecture and momentum. For you, Hong Kong is less a collection of places than a continuous flow.' },
  'KINETIC|WIDE|ATMOSPHERE': { title: 'THE EDGE WALKER', sentence: 'You are drawn to the places where motion opens into distance, water, and air.', conclusionLead: 'YOUR HONG KONG EXISTS AT THE EDGE.', conclusion: 'You look for the moment when the dense city begins to loosen. Waterfronts, horizons and transitional spaces give you room to understand Hong Kong from a little farther away.' },
  'REFLECTIVE|CLOSE|STRUCTURE': { title: 'THE MATERIAL READER', sentence: 'You find Hong Kong in surfaces, objects, repairs, and the logic hidden in small things.', conclusionLead: 'YOUR HONG KONG IS BUILT FROM WHAT PEOPLE LEAVE BEHIND.', conclusion: 'You read the city through texture and use: worn tiles, repaired objects, shopfronts and accumulated layers. These ordinary materials tell you more than polished landmarks ever could.' },
  'REFLECTIVE|CLOSE|ATMOSPHERE': { title: 'THE QUIET OBSERVER', sentence: 'You understand Hong Kong by slowing down and noticing what remains.', conclusionLead: 'YOUR HONG KONG IS MADE OF QUIET TRACES.', conclusion: 'You are drawn to what survives after the city moves on — worn surfaces, fading light, overlooked corners and fragments of memory. The quieter the detail, the longer it tends to stay with you.' },
  'REFLECTIVE|WIDE|STRUCTURE': { title: 'THE SPACE READER', sentence: 'You step back to understand how form, distance, and empty space shape the city.', conclusionLead: 'YOUR HONG KONG IS DEFINED BY SPACE AS MUCH AS OBJECTS.', conclusion: 'You notice distance, proportion and the gaps between things. Architecture becomes meaningful not only through what is built, but through the air, horizon and absence surrounding it.' },
  'REFLECTIVE|WIDE|ATMOSPHERE': { title: 'THE MEMORY KEEPER', sentence: 'You remember Hong Kong through atmosphere, distance, and the traces that refuse to disappear.', conclusionLead: 'YOUR HONG KONG IS SOMETHING YOU REMEMBER BEFORE YOU CAN EXPLAIN IT.', conclusion: 'Places stay with you as colours, weather, light and incomplete images. Your city is not a precise record — it is an accumulation of feelings that slowly become memory.' },
};

function getResultProfile(choices: { central: string; mong: string; sham: string; west: string; kennedy: string }) {
  const selected = [choices.central, choices.mong, choices.sham, choices.west, choices.kennedy].map((choice) => choiceAxes[choice] || [-1, -1, -1]);
  const totals = selected.reduce(([rhythm, attention, lens], [r, a, l]) => [rhythm + r, attention + a, lens + l], [0, 0, 0]);
  const key = `${totals[0] > 0 ? 'KINETIC' : 'REFLECTIVE'}|${totals[1] > 0 ? 'CLOSE' : 'WIDE'}|${totals[2] > 0 ? 'STRUCTURE' : 'ATMOSPHERE'}`;
  return resultProfiles[key];
}

function getResultKey(choices: { central: string; mong: string; sham: string; west: string; kennedy: string }) {
  const selected = [choices.central, choices.mong, choices.sham, choices.west, choices.kennedy].map((choice) => choiceAxes[choice] || [-1, -1, -1]);
  const totals = selected.reduce(([rhythm, attention, lens], [r, a, l]) => [rhythm + r, attention + a, lens + l], [0, 0, 0]);
  return `${totals[0] > 0 ? 'KINETIC' : 'REFLECTIVE'}-${totals[1] > 0 ? 'CLOSE' : 'WIDE'}-${totals[2] > 0 ? 'STRUCTURE' : 'ATMOSPHERE'}`;
}

const atmosphereWeights: Record<string, Record<string, number>> = {
  slow: { QUIET: 5, SLOW: 5, STILL: 4, SOFT: 2 }, moving: { RESTLESS: 5, DRIFTING: 4, WARM: 1 },
  light: { LUMINOUS: 5, WARM: 4, STILL: 1 }, sea: { SOFT: 5, DRIFTING: 4, OPEN: 4 },
  silence: { QUIET: 5, STILL: 5, FADING: 3 }, feeling: { WARM: 5, SOFT: 4, FADING: 4 },
};

const placeWeights: Record<string, Record<string, number>> = {
  details: { FRAGMENT: 5, TRACE: 4, GRID: 3 }, energy: { CURRENT: 5, STREET: 4 }, people: { STREET: 5, PASSAGE: 4 }, noise: { GRID: 4, FRAGMENT: 4 },
  objects: { ARCHIVE: 5, FRAGMENT: 4 }, imperfection: { FRAGMENT: 5, EDGE: 4 }, memory: { ARCHIVE: 5, TRACE: 4 },
  form: { GRID: 5, FIELD: 4 }, light: { FIELD: 5, HORIZON: 4 }, distance: { HORIZON: 5, DISTANCE: 5, EDGE: 4 }, possibility: { PASSAGE: 5, FIELD: 4, CURRENT: 3 },
};

const allowedPlaces: Record<string, string[]> = {
  QUIET: ['HORIZON', 'ARCHIVE', 'TRACE', 'DISTANCE', 'FIELD', 'PASSAGE'], RESTLESS: ['GRID', 'CURRENT', 'STREET', 'FRAGMENT'],
  SOFT: ['CURRENT', 'HORIZON', 'TRACE', 'TIDE', 'DISTANCE', 'FIELD'], WARM: ['CURRENT', 'TIDE', 'ARCHIVE', 'STREET', 'EDGE'],
  OPEN: ['HORIZON', 'FIELD', 'DISTANCE', 'PASSAGE', 'CURRENT'], SLOW: ['PASSAGE', 'HORIZON', 'ARCHIVE', 'TIDE', 'DISTANCE'],
  LUMINOUS: ['FIELD', 'EDGE', 'HORIZON', 'CURRENT', 'TIDE'], DRIFTING: ['CURRENT', 'TIDE', 'DISTANCE', 'PASSAGE', 'TRACE'],
  STILL: ['HORIZON', 'ARCHIVE', 'FIELD', 'DISTANCE', 'EDGE'], FADING: ['TRACE', 'ARCHIVE', 'TIDE', 'FRAGMENT', 'EDGE'],
};

function makePlaceName(choices: { central: string; mong: string; sham: string; west: string; kennedy: string }) {
  const atmosphere = Object.entries({ ...atmosphereWeights[choices.central], ...atmosphereWeights[choices.kennedy] }).reduce<Record<string, number>>((scores, [word, score]) => {
    scores[word] = (scores[word] || 0) + score;
    return scores;
  }, {});
  const place = Object.entries({ ...placeWeights[choices.mong], ...placeWeights[choices.sham], ...placeWeights[choices.west] }).reduce<Record<string, number>>((scores, [word, score]) => {
    scores[word] = (scores[word] || 0) + score;
    return scores;
  }, {});
  const key = `${choices.central}-${choices.mong}-${choices.sham}-${choices.west}-${choices.kennedy}`;
  const hash = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const atmospheres = Object.keys(atmosphere).sort((a, b) => atmosphere[b] - atmosphere[a] || a.localeCompare(b));
  const selectedAtmosphere = atmospheres[hash % Math.min(4, atmospheres.length)];
  const compatible = allowedPlaces[selectedAtmosphere] || [];
  const places = Object.keys(place).sort((a, b) => place[b] - place[a] || a.localeCompare(b));
  const compatiblePlaces = places.filter((word) => compatible.includes(word));
  const selectedPlace = (compatiblePlaces.length ? compatiblePlaces : compatible)[hash % (compatiblePlaces.length || compatible.length)];
  return `THE ${selectedAtmosphere} ${selectedPlace}`;
}

export default function MoodPage() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [dragX, setDragX] = useState<number | null>(null);
  const [choices, setChoices] = useState({ central: 'slow', mong: 'details', sham: 'memory', west: 'distance', kennedy: 'sea' });
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('final') === '1') setIndex(pages.length - 1);
    const westMood = JSON.parse(read('west-kowloon-mood') || '{}');
    const westObservation = JSON.parse(read('west-kowloon-observation') || '{}');
    const kennedy = JSON.parse(read('kennedy-town-mood') || '{}');
    // The explicit make-space choice is the user's final West Kowloon choice.
    // The observation is only an intermediate interaction and must not mask it.
    const westChoice = ({ CREATE: 'POSSIBILITY', WANDER: 'DISTANCE', OBSERVE: 'FORM', REST: 'LIGHT' } as Record<string, string>)[westMood.response] || westObservation.observation || 'DISTANCE';
    setChoices({
      central: read('central-mood-choice') || 'slow',
      mong: normalizeMongKokChoice(read('mong-kok-mood')),
      sham: read('sham-shui-po-memory') || 'memory',
      west: String(westChoice).toLowerCase(),
      kennedy: String(kennedy.response || 'SEA').toLowerCase(),
    });
  }, []);

  const turn = (step: number) => {
    setDirection(step > 0 ? 'next' : 'prev');
    setIndex((current) => Math.max(0, Math.min(pages.length - 1, current + step)));
  };

  const jumpToFinal = () => {
    setDirection('next');
    setIndex(pages.length - 1);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    dragStart.current = event.clientX;
    setDragX(event.clientX);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (dragStart.current !== null && Math.abs(event.clientX - dragStart.current) > 70) turn(event.clientX < dragStart.current ? 1 : -1);
    dragStart.current = null;
    setDragX(null);
  };

  const startAgain = () => {
    ['central-mood-choice', 'mong-kok-mood', 'sham-shui-po-memory', 'west-kowloon-mood', 'west-kowloon-observation', 'kennedy-town-mood', 'kennedy-town-light-archive'].forEach((key) => localStorage.removeItem(key));
    window.location.href = '/';
  };

  const current = pages[index];
  const finalClass = `book-driven-${choices.central} book-mong-${choices.mong} book-sham-${choices.sham} book-west-${choices.west} book-kt-${choices.kennedy}`;
  return (
    <main className={`memory-book ${finalClass}`} onPointerDown={onPointerDown} onPointerUp={onPointerUp} data-dragging={dragX !== null}>
      <header className="book-nav"><Link href="/">CITY MOOD MAP</Link><span>YOUR HONG KONG / 06</span></header>
      <div className="book-shell">
      <section className={`book-page book-page-${current} book-page-${direction}`} aria-live="polite">
        {current === 'cover' && <div className="book-cover"><img className="book-illustration illustration-opening" src="/mood-book/central.png" alt="Central architectural line drawing" /><p className="book-kicker">01 / CITY AS A BOOK OF MEMORY</p><h1>A CITY IS NEVER<br />REMEMBERED<br /><em>ALL AT ONCE.</em></h1><p className="book-instruction">Turn the pages.</p><a className="book-skip-final" href="/mood?final=1">SKIP TO YOUR HONG KONG →</a></div>}
        {current === 'intro' && <div className="book-intro"><img className="book-illustration illustration-introduction" src="/mood-book/kennedy-town.png" alt="Kennedy Town coastal line drawing" /><p className="book-kicker">02 / INTRODUCTION</p><h2>FIVE PLACES.<br />FIVE MOMENTS.<br /><em>ONE CITY</em><br />YOU NOTICED DIFFERENTLY.</h2><div className="book-numbers">01&nbsp;&nbsp; 02&nbsp;&nbsp; 03&nbsp;&nbsp; 04&nbsp;&nbsp; 05</div></div>}
        {current === 'central' && <CentralMemorySpread choice={choices.central} />}
        {current === 'mong' && <MongKokMemorySpread choice={choices.mong} />}
        {current === 'sham' && <ShamShuiPoMemorySpread choice={choices.sham} />}
        {current === 'west' && <WestKowloonMemorySpread choice={choices.west} />}
        {current === 'kennedy' && <KennedyTownMemorySpread choice={choices.kennedy} />}
        {current === 'keep' && <div className="book-keep"><p className="book-kicker">08 / AFTER THE CITY</p><h2>SO WHAT<br />DID YOU KEEP?</h2><p>Five places left five traces.</p><span>TURN THE LAST PAGE →</span></div>}
        {current === 'final' && <FinalPostcardCanvas centralChoice={PREVIEW_CENTRAL_KEEP_MOVING ? 'moving' : choices.central} mongChoice={PREVIEW_MONG_ENERGY ? 'energy' : PREVIEW_MONG_PEOPLE ? 'people' : PREVIEW_MONG_NOISE ? 'noise' : PREVIEW_MONG_DETAILS ? 'details' : choices.mong} shamChoice={PREVIEW_SHAM_OBJECTS ? 'objects' : PREVIEW_SHAM_PEOPLE ? 'people' : PREVIEW_SHAM_IMPERFECTION ? 'imperfection' : PREVIEW_SHAM_MEMORY ? 'memory' : choices.sham} westChoice={PREVIEW_WEST_FORM ? 'form' : PREVIEW_WEST_LIGHT ? 'light' : PREVIEW_WEST_DISTANCE ? 'distance' : PREVIEW_WEST_POSSIBILITY ? 'possibility' : choices.west} kennedyChoice={choices.kennedy} />}
      </section>
      <button className="book-edge book-edge-left" aria-label="Previous page" onClick={() => turn(-1)} />
      <button className="book-edge book-edge-right" aria-label="Next page" onClick={() => turn(1)} />
      <div className="book-turn-hint">{index === 0 ? 'Turn the pages.' : index === pages.length - 1 ? 'Your Hong Kong.' : 'TURN →'}</div>
      <div className="book-progress">{pages.map((_, i) => <span key={i} className={i <= index ? 'is-seen' : ''}>{String(i + 1).padStart(2, '0')}</span>)}</div>
      </div>
      <footer className="book-footer"><Link href="/">← RETURN HOME</Link><span>{String(index + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</span></footer>
    </main>
  );
}

function FinalPostcardCanvas({ centralChoice, mongChoice, shamChoice, westChoice, kennedyChoice }: { centralChoice: string; mongChoice: string; shamChoice: string; westChoice: string; kennedyChoice: string }) {
  // These are large RGBA illustrations. Keep repeated visits from eagerly
  // scheduling every selected surface at once; this does not affect layout or
  // the artwork once it enters the visible postcard canvas.
  const imageProps = { decoding: 'async' as const, loading: 'lazy' as const, fetchPriority: 'low' as const };
  const kennedyImage = kennedyChoice === 'light' ? '/postcard/kennedy-town-light.png' : kennedyChoice === 'sea' ? '/postcard/kennedy-town-sea.png' : kennedyChoice === 'silence' ? '/postcard/kennedy-town-silence.png' : '/postcard/kennedy-town-feeling.png';
  const result = getResultProfile({ central: centralChoice, mong: mongChoice, sham: shamChoice, west: westChoice, kennedy: kennedyChoice });
  const resultKey = getResultKey({ central: centralChoice, mong: mongChoice, sham: shamChoice, west: westChoice, kennedy: kennedyChoice });
  const summary = [centralChoice === 'moving' ? 'KEEP MOVING' : 'SLOW DOWN', mongChoice.toUpperCase(), shamChoice.toUpperCase(), westChoice.toUpperCase(), kennedyChoice === 'light' ? 'LIGHT' : kennedyChoice === 'silence' ? 'SILENCE' : kennedyChoice === 'feeling' ? 'FEELING' : 'SEA'];
  return <div className={`book-final book-final-postcard result-${resultKey} postcard-central-${centralChoice} postcard-mong-${mongChoice} postcard-sham-${shamChoice} postcard-west-${westChoice} postcard-kennedy-${kennedyChoice}`}>
    <header className="final-result-header"><p className="final-result-kicker">YOUR HONG KONG</p><h1>{result.title}</h1><p className="final-result-sentence">{result.sentence}</p><div className="final-result-conclusion"><p className="final-result-conclusion-label">YOUR HONG KONG IS</p><p className="final-result-conclusion-title">{result.conclusionLead.replace(/^YOUR HONG KONG IS\s*/, '')}</p><p className="final-result-conclusion-body">{result.conclusion}</p></div><p className="final-result-meta">512 POSSIBLE COMBINATIONS&nbsp;&nbsp;&nbsp; 8 RESULT TYPES</p></header>
    <div className="final-map-field final-collage-field" aria-label="Personal Hong Kong collage">
      <div className="map-cluster cluster-sham"><div className="map-artwork">{shamChoice === 'objects' && <img {...imageProps} src="/postcard/sham-shui-po/objects.png" alt="" aria-hidden="true" />}{shamChoice === 'people' && <img {...imageProps} src="/postcard/sham-shui-po/people.png" alt="" aria-hidden="true" />}{shamChoice === 'imperfection' && <img {...imageProps} src="/postcard/sham-shui-po/imperfection.png" alt="" aria-hidden="true" />}{shamChoice === 'memory' && <img {...imageProps} src="/postcard/sham-shui-po/memory.png" alt="" aria-hidden="true" />}</div></div>
      <div className="map-cluster cluster-mong"><div className="map-artwork">{mongChoice === 'energy' && <img {...imageProps} src="/postcard/mong-kok/energy.png" alt="" aria-hidden="true" />}{mongChoice === 'people' && <img {...imageProps} src="/postcard/mong-kok/people.png" alt="" aria-hidden="true" />}{mongChoice === 'noise' && <img {...imageProps} src="/postcard/mong-kok/noise.png" alt="" aria-hidden="true" />}{mongChoice === 'details' && <img {...imageProps} src="/postcard/mong-kok/details.png" alt="" aria-hidden="true" />}</div></div>
      <div className="map-cluster cluster-west"><div className="map-artwork">{westChoice === 'form' && <img {...imageProps} src="/postcard/west-kowloon/form.png" alt="" aria-hidden="true" />}{westChoice === 'light' && <img {...imageProps} src="/postcard/west-kowloon/light.png" alt="" aria-hidden="true" />}{westChoice === 'distance' && <img {...imageProps} src="/postcard/west-kowloon/distance.png" alt="" aria-hidden="true" />}{westChoice === 'possibility' && <img {...imageProps} src="/postcard/west-kowloon/possibility.png" alt="" aria-hidden="true" />}</div></div>
      <div className="map-cluster cluster-central"><div className="map-artwork">{centralChoice === 'moving' && <img {...imageProps} src="/postcard/central/keep-moving.png" alt="" aria-hidden="true" />}{centralChoice === 'slow' && <img {...imageProps} src="/postcard/central/slow-down.png" alt="" aria-hidden="true" />}</div></div>
      <div className="map-cluster cluster-kennedy"><div className="map-artwork"><img {...imageProps} src={kennedyImage} alt="" aria-hidden="true" /></div></div>
    </div>
    <p className="final-choice-summary" aria-label="Selected qualities">{summary.join(' · ')}</p>
  </div>;
}

function MongKokGenerativeSystem({ choice }: { choice: string }) {
  if (choice === 'energy') return <div className="gen-mong-system mong-system-energy" aria-hidden="true"><b>GO</b><b>NOW</b><span>18:47</span><i>MK</i></div>;
  if (choice === 'people') return <div className="gen-mong-system mong-system-people mong-system-dancers" aria-hidden="true"><svg className="mong-dance-svg" viewBox="0 0 720 430" role="presentation"><g className="dancer dancer-a"><ellipse className="dance-trace trace-a" cx="168" cy="302" rx="74" ry="18" /><g className="figure"><path className="body" d="M147 132c-20 18-28 52-24 92l-18 75c-4 17 8 28 25 22l35-61 11 69c3 17 18 22 31 11l-12-111c10-32 5-75-13-93z"/><circle className="head" cx="157" cy="99" r="30"/><path className="arm arm-back" d="M132 151c-30 24-54 48-72 73-7 10 4 22 14 16l74-54z"/><path className="arm arm-front" d="M177 147c25 9 52 27 76 52 10 10 1 24-11 18l-83-42z"/><path className="leg leg-back" d="M134 279l-43 86c-6 13 10 22 19 12l65-70z"/><path className="leg leg-front" d="M166 273l24 93c4 14 22 12 21-3l-8-107z"/></g></g><g className="dancer dancer-b"><ellipse className="dance-trace trace-b" cx="551" cy="302" rx="68" ry="16" /><g className="figure"><path className="body" d="M548 135c18 23 24 56 14 91l25 73c6 17-5 28-21 23l-42-55-5 77c-1 16-17 22-30 12l3-117c-16-30-14-69 2-95z"/><circle className="head" cx="548" cy="101" r="25"/><path className="arm arm-back" d="M526 150c-27 13-48 30-68 55-8 10 3 21 13 15l73-39z"/><path className="arm arm-front" d="M568 153c31 19 57 40 78 62 9 10-1 22-12 16l-78-43z"/><path className="leg leg-back" d="M531 286l-22 82c-4 14-21 11-20-3l5-102z"/><path className="leg leg-front" d="M559 282l56 77c8 12-6 23-16 13l-68-57z"/></g></g></svg><span className="dance-label label-left">HERE</span><span className="dance-label label-right">STILL HERE</span><span className="dance-meta">02 / MONG KOK &nbsp; · &nbsp; PEOPLE &nbsp; · &nbsp; 18:47</span></div>;
  if (choice === 'noise') return <div className="gen-mong-system mong-system-noise" aria-hidden="true">{['EXIT E2','18:47','OPEN LATE','ARGYLE STREET →','WAIT','CROSS NOW','NEXT TRAIN','MK / 02','SHOP 24H','← EXIT','3F','NO. 17','KEEP MOVING','旺角','STAND CLEAR','00:42'].map((item, i) => <span key={`${item}-${i}`}>{item}</span>)}</div>;
  return <div className="gen-mong-system mong-system-details" aria-hidden="true"><span>22.3193 N</span><span>114.1694 E</span><span>18:47:22</span><span>MK / 02</span><span>OBJECT 07</span><span>3F</span><span>EXIT E2</span><i /><i /><i /></div>;
}

function CentralMemorySpread({ choice }: { choice: string }) {
  return <div className={`district-spread spread-central central-${choice}`}><img className="book-illustration illustration-central" src="/mood-book/opening.png" alt="Abstract open-book line drawing" /><p className="book-kicker">03 / CENTRAL · 01</p><div className="central-word">C<br />E<br />N<br />T<br />R<br />A<br />L</div><div className="central-lines" aria-hidden="true" /> <div className="central-data">08:42<br />47 FLOORS<br />22.2819 N<br />114.1582 E</div><p className="central-memory">Everything kept moving.<br /><em>You chose to {choice === 'moving' ? 'keep moving.' : 'slow down.'}</em></p><span className="spread-index">03 / MEMORY</span></div>;
}

function MongKokMemorySpread({ choice }: { choice: string }) {
  const fragments = choice === 'people' ? ['YOU THERE?', 'ON MY WAY', 'WHO IS NEXT?'] : choice === 'details' ? ['02 / MK', '18:47', 'MICRO OBSERVATION'] : choice === 'noise' ? ['WAIT', 'CROSS NOW', 'OPEN LATE', 'EXIT E2'] : ['ARGYLE STREET', 'NEXT TRAIN', 'KEEP MOVING'];
  return <div className={`district-spread spread-mong mong-${choice}`}><img className="book-illustration illustration-mong" src="/mood-book/introduction.png" alt="Five connected city memory marks" /><p className="book-kicker">04 / MONG KOK · 02</p><div className="mong-title"><span>MONG</span><span>KOK</span></div>{fragments.map((fragment, i) => <span className={`mong-fragment fragment-${i}`} key={fragment}>{fragment}</span>)}<p className="mong-memory">Among all that movement,<br /><em>you noticed {choice}.</em></p><span className="spread-index">04 / MEMORY</span></div>;
}

function ShamShuiPoMemorySpread({ choice }: { choice: string }) {
  const labels = choice === 'objects' ? ['OBJECT 03', 'FOUND / SSP'] : choice === 'people' ? ['SOMEONE PASSED', 'LIVED / SSP'] : choice === 'imperfection' ? ['EDGE / 07', 'REPAIRED'] : ['MEMORY / 03', 'STILL HERE'];
  return <div className={`district-spread spread-sham sham-${choice}`}><img className="book-illustration illustration-sham" src="/mood-book/mong-kok.png" alt="Mong Kok urban line drawing" /><p className="sham-label">05 / SHAM SHUI PO · 03<br />SSP<br />22.3302 N</p><div className="sham-fragment sham-fragment-large"><span>{labels[0]}</span><b>{choice === 'memory' ? 'a place remembers in layers' : 'found material / kept close'}</b></div><div className="sham-fragment sham-fragment-small"><span>{labels[1]}</span><i>03</i></div><p className="sham-note">A small trace remained.<br /><em>You kept {choice}.</em></p><span className="spread-index">05 / FOUND</span></div>;
}

function WestKowloonMemorySpread({ choice }: { choice: string }) {
  return <div className={`district-spread spread-west west-${choice}`}><img className="book-illustration illustration-west" src="/mood-book/west-kowloon-v2.png" alt="West Kowloon horizon line drawing" /><p className="west-label">06 / WEST KOWLOON · 04</p><div className="west-title"><span>WEST</span><span>KOWLOON</span></div><div className="west-horizon" aria-hidden="true" /><p className="west-left">More<br />space.</p><p className="west-right">You looked<br /><em>toward {choice}.</em></p><span className="spread-index">06 / MEMORY</span></div>;
}

function KennedyTownMemorySpread({ choice }: { choice: string }) {
  const copy = choice === 'light' ? 'I remember the light\nbefore I remember the day.' : choice === 'sea' ? 'The water held\nwhat the day could not.' : choice === 'silence' ? 'Nothing happened.\nAnd I stayed.' : 'The city softened.\nI kept the feeling.';
  return <div className={`district-spread spread-kennedy kennedy-${choice}`}><img className="book-illustration illustration-kennedy" src="/mood-book/west-kowloon.png" alt="West Kowloon horizon line drawing" /><div className="kennedy-image" aria-hidden="true" /><p className="kennedy-caption">07 / KENNEDY TOWN · 05<br />18:37</p><p className="kennedy-memory">{copy}</p><span className="spread-index">07 / MEMORY</span></div>;
}
