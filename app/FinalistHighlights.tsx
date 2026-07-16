"use client";

import { useEffect, useMemo, useState } from "react";
import data from "./data/finalist-highlights.json";

type Highlight = (typeof data.players)[number]["highlights"][number];

const clipKey = (player: string, replayId: string) => `${player}::${replayId}`;

function fmt(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

function pct(value: number) {
  return `${fmt(value * 100, 1)}%`;
}

function cardText(cards: string[]) {
  return cards.length ? cards.join(" ") : "Cards hidden";
}

export function FinalistHighlights() {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [useFilter, setUseFilter] = useState("Primary");
  const [reviewFilter, setReviewFilter] = useState("Unreviewed");
  const [playerFilter, setPlayerFilter] = useState("All finalists");
  const [copyStatus, setCopyStatus] = useState("COPY SHORTLIST");

  useEffect(() => {
    setReviewed(new Set(JSON.parse(localStorage.getItem("finalist-highlight-reviewed") || "[]")));
    setShortlisted(new Set(JSON.parse(localStorage.getItem("finalist-highlight-shortlist") || "[]")));
  }, []);

  const toggle = (kind: "reviewed" | "shortlisted", id: string) => {
    const current = kind === "reviewed" ? reviewed : shortlisted;
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    if (kind === "reviewed") {
      setReviewed(next);
      localStorage.setItem("finalist-highlight-reviewed", JSON.stringify([...next]));
    } else {
      setShortlisted(next);
      localStorage.setItem("finalist-highlight-shortlist", JSON.stringify([...next]));
    }
  };

  const visiblePlayers = useMemo(() => data.players.map(player => ({
    ...player,
    highlights: player.highlights.filter(clip => {
      if (playerFilter !== "All finalists" && player.name !== playerFilter) return false;
      if (useFilter !== "All clips" && clip.recommendedUse !== useFilter) return false;
      const key = clipKey(player.sourceName, clip.replayId);
      if (reviewFilter === "Unreviewed" && reviewed.has(key)) return false;
      if (reviewFilter === "Reviewed" && !reviewed.has(key)) return false;
      if (reviewFilter === "Shortlisted" && !shortlisted.has(key)) return false;
      return true;
    }),
  })).filter(player => player.highlights.length), [playerFilter, useFilter, reviewFilter, reviewed, shortlisted]);

  const progress = Math.round((reviewed.size / data.summary.highlights) * 100);

  const copyShortlist = async () => {
    const lines = data.players.flatMap(player => player.highlights
      .filter(clip => shortlisted.has(clipKey(player.sourceName, clip.replayId)))
      .map(clip => `${player.name}\t${clip.recommendedUse}\t${clip.category}\t${clip.replayUrl}`));
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopyStatus(lines.length ? `COPIED ${lines.length} CLIPS` : "SHORTLIST IS EMPTY");
    window.setTimeout(() => setCopyStatus("COPY SHORTLIST"), 1800);
  };

  return (
    <main className="highlight-page" id="top">
      <header className="topbar highlight-topbar">
        <a className="brand" href="/finalist-highlights"><span className="brand-mark">A</span><span>ARENA / HIGHLIGHT REVIEW</span></a>
        <nav><a href="/preferred-eight">PREFERRED 8</a><a href="/candidates">FULL POOL</a></nav>
      </header>

      <section className="highlight-hero">
        <span className="section-kicker">FINALIST EDITORIAL PASS · INTERNAL</span>
        <h1>Eight styles.<br /><em>Eighty stories.</em></h1>
        <div className="highlight-hero-grid">
          <p>All available table summaries were scanned; 393 full replays were deep-reviewed. The final set balances signature style, visual drama, commentary decisions, opponent variety and honest downside—not just the biggest wins.</p>
          <div><span>Tables scanned<strong>{fmt(data.summary.tablesScanned)}</strong></span><span>Full replays reviewed<strong>{fmt(data.summary.replaysDeepReviewed)}</strong></span><span>Final clips<strong>{data.summary.highlights}</strong></span></div>
        </div>
      </section>

      <aside className="highlight-format-note"><strong>FORMAT NOTE</strong><span>AlphaHorizon uses Tournament S5 six-max evidence; the other seven use Heads-Up Ladder data. Its style indicators are directional and should not be treated as a direct cross-format ranking.</span></aside>

      <section className="highlight-progress">
        <div><span>YOUR REVIEW PROGRESS</span><strong>{reviewed.size} / {data.summary.highlights}</strong></div>
        <div className="highlight-progress-track"><span style={{ width: `${progress}%` }} /></div>
        <small>{progress}% complete · progress and clip shortlist are saved in this browser</small>
      </section>

      <aside className="highlight-export"><span>NEED THE RAW WORKING LIST?</span><div><button onClick={copyShortlist}>{copyStatus}</button><a href="/finalist-highlight-manifest.csv" download>DOWNLOAD 80-CLIP CSV ↗</a></div></aside>

      <section className="highlight-controls">
        <select value={playerFilter} onChange={event => setPlayerFilter(event.target.value)} aria-label="Filter finalist"><option>All finalists</option>{data.players.map(player => <option key={player.name}>{player.name}</option>)}</select>
        <select value={useFilter} onChange={event => setUseFilter(event.target.value)} aria-label="Filter recommendation"><option>All clips</option><option>Primary</option><option>Secondary</option><option>Backup</option></select>
        <select value={reviewFilter} onChange={event => setReviewFilter(event.target.value)} aria-label="Filter review status"><option>All status</option><option>Unreviewed</option><option>Reviewed</option><option>Shortlisted</option></select>
        <span>{visiblePlayers.reduce((sum, player) => sum + player.highlights.length, 0)} visible</span>
      </section>

      <nav className="highlight-jump" aria-label="Jump to finalist">
        {data.players.map(player => <a key={player.name} href={`#finalist-${player.order}`}><span>{String(player.order).padStart(2, "0")}</span>{player.name}</a>)}
      </nav>

      <section className="highlight-players">
        {visiblePlayers.map(player => {
          const playerReviewed = player.highlights.filter(clip => reviewed.has(clipKey(player.sourceName, clip.replayId))).length;
          return (
            <article className="highlight-player" id={`finalist-${player.order}`} style={{ "--player-accent": player.accent } as React.CSSProperties} key={player.name}>
              <header className="highlight-player-header">
                <span className="highlight-player-order">{String(player.order).padStart(2, "0")}</span>
                <img src={player.profile.avatar} alt="" />
                <div className="highlight-player-name"><span>{player.source}</span><h2>{player.name}</h2><a href={`https://x.com/${player.profile.handle}`} target="_blank" rel="noreferrer">@{player.profile.handle} ↗</a></div>
                <div className="highlight-style"><span>STYLE POSITIONING</span><strong>{player.style.title}</strong>{player.name === "AlphaHorizon" && <b className="highlight-format-badge">6-MAX SAMPLE · NOT DIRECTLY COMPARABLE TO HU</b>}<p>{player.style.summary}</p></div>
                <div className="highlight-player-progress"><strong>{playerReviewed} / {player.highlights.length}</strong><span>visible clips reviewed</span></div>
              </header>

              <div className="highlight-stat-row">
                <div><span>Hands played</span><strong>{pct(player.stats.vpip)}</strong><small>VPIP</small></div>
                <div><span>Raises preflop</span><strong>{pct(player.stats.pfr)}</strong><small>PFR</small></div>
                <div><span>Aggression</span><strong>{fmt(player.stats.af, 2)}</strong><small>factor</small></div>
                <div><span>Re-raises</span><strong>{pct(player.stats.threeBetPct)}</strong><small>3-bet rate</small></div>
                <div><span>Showdown wins</span><strong>{pct(player.stats.wsd)}</strong><small>when shown</small></div>
                <div><span>Coverage</span><strong>{fmt(player.tablesScanned)}</strong><small>tables scanned</small></div>
              </div>

              <aside className="highlight-commentary-angle"><span>COMMENTARY ANGLE</span><p>{player.style.commentary}</p></aside>

              <div className="highlight-grid">
                {player.highlights.map((clip: Highlight) => {
                  const key = clipKey(player.sourceName, clip.replayId);
                  const isReviewed = reviewed.has(key);
                  const isShortlisted = shortlisted.has(key);
                  return (
                    <article className={`highlight-card ${isReviewed ? "is-reviewed" : ""} ${isShortlisted ? "is-shortlisted" : ""}`} key={clip.replayId}>
                      <div className="highlight-card-top"><span className={`highlight-use highlight-use-${clip.recommendedUse.toLowerCase()}`}>{clip.recommendedUse}</span><span>{clip.category}</span><b>#{clip.rank}</b></div>
                      <div className="highlight-hand"><strong>{cardText(clip.heroCards)}</strong><span>vs {clip.opponent}</span></div>
                      <div className="highlight-board"><span>BOARD</span><strong>{cardText(clip.board)}</strong></div>
                      <div className="highlight-result"><strong className={clip.won ? "positive" : "negative"}>{clip.won ? "WIN" : "LOSS"} {clip.chipDelta > 0 ? "+" : ""}{fmt(clip.chipDelta)}</strong><span>net chip result</span></div>
                      <p className="highlight-summary">{clip.highlight}</p>
                      <div className="highlight-reason"><span>WHY IT REPRESENTS THE STYLE</span><p>{clip.whyStyle}</p></div>
                      <div className="highlight-hook"><span>COMMENTARY HOOK</span><p>{clip.commentaryHook}</p></div>
                      <details className="highlight-action"><summary>View action line</summary><p>{clip.actionLine}</p></details>
                      <div className="highlight-scores"><span>Style<strong>{clip.styleScore}</strong></span><span>Drama<strong>{clip.dramaScore}</strong></span><span>Commentary<strong>{clip.commentaryScore}</strong></span></div>
                      <div className="highlight-actions">
                        <a href={clip.replayUrl} target="_blank" rel="noreferrer" onClick={() => { if (!isReviewed) toggle("reviewed", key); }}>OPEN REPLAY ↗</a>
                        <button onClick={() => toggle("reviewed", key)}>{isReviewed ? "✓ REVIEWED" : "MARK REVIEWED"}</button>
                        <button onClick={() => toggle("shortlisted", key)}>{isShortlisted ? "★ SHORTLISTED" : "☆ SHORTLIST"}</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>

      <aside className="highlight-method"><span>EDITORIAL METHOD</span><p>{data.method.scanned}. {data.method.scouted}. Final selection: {data.method.selected}. “Primary” means start tomorrow’s review there; it does not mean the clip is approved for the public stream yet.</p></aside>
      <footer className="preferred-footer"><span>FINALIST HIGHLIGHT REVIEW · {new Date(data.generatedAt).toLocaleDateString("en-US")}</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
