"use client";

import { useEffect, useMemo, useState } from "react";
import candidateData from "./data/candidates.json";

type Candidate = {
  selectionRank: number;
  tier: string;
  name: string;
  handle: string;
  displayName: string;
  avatar: string;
  bio?: string | null;
  followers?: number | null;
  following?: number | null;
  posts?: number | null;
  accountCreated?: string | null;
  identityRisk: "Low" | "Medium" | "High";
  identityNote: string;
  selectionScore?: number | null;
  huRank?: number | null;
  previousHuRank?: number | null;
  huTrueSkill?: number | null;
  huScoredHands: number;
  huHistoricalHands: number;
  realizedBb100?: number | null;
  recent1000Bb100?: number | null;
  previous1000Bb100?: number | null;
  tournamentSeasons: number;
  tournamentAvgPercentile: number;
  tournamentBestRank?: number | null;
  tournamentLatestRank?: number | null;
  totalObservedHands: number;
  reliability?: number | null;
  medianDecisionSec?: number | null;
  sampledTimeoutRate?: number | null;
  sampledActions: number;
  contentRate?: number | null;
  contentGrade: string;
  clipCandidateCount: number;
  style: string;
  vpip: number;
  pfr: number;
  aggressionFactor: number;
  threeBetPct: number;
  showdownWinPct: number;
  topReplayId?: string | null;
  topReplayUrl?: string | null;
  topReplayOpponent?: string | null;
  topReplayResult?: number | string | null;
};

const candidates = candidateData.candidates as Candidate[];
const tierOptions = ["All tiers", "Locked", "Shortlist", "Strong backup", "Review", "Longshot"];
const riskOptions = ["All identity", "Low", "Medium", "High"];

function fmt(value?: number | null, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function signed(value?: number | null, digits = 1) {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${fmt(value, digits)}`;
}

function riskClass(risk: Candidate["identityRisk"]) {
  return `risk-${risk.toLowerCase()}`;
}

function tierClass(tier: string) {
  return `tier-${tier.toLowerCase().replaceAll(" ", "-")}`;
}

function avatarInitials(candidate: Candidate) {
  return candidate.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export function CandidatePool() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All tiers");
  const [risk, setRisk] = useState("All identity");
  const [sort, setSort] = useState("Composite rank");
  const [shortlisted, setShortlisted] = useState<string[]>([]);

  useEffect(() => {
    try {
      setShortlisted(JSON.parse(localStorage.getItem("poker-candidate-shortlist") || "[]"));
    } catch {
      setShortlisted([]);
    }
  }, []);

  const shortlistSet = useMemo(() => new Set(shortlisted), [shortlisted]);

  const visible = useMemo(() => {
    const rows = candidates.filter((candidate) => {
      const text = `${candidate.name} ${candidate.displayName} ${candidate.handle} ${candidate.style} ${candidate.tier}`.toLowerCase();
      return (!query || text.includes(query.toLowerCase())) &&
        (tier === "All tiers" || candidate.tier === tier) &&
        (risk === "All identity" || candidate.identityRisk === risk);
    });
    const ordered = [...rows];
    ordered.sort((a, b) => {
      if (sort === "Current HU rank") return (a.huRank ?? 999) - (b.huRank ?? 999);
      if (sort === "Tournament") return (b.tournamentAvgPercentile ?? 0) - (a.tournamentAvgPercentile ?? 0);
      if (sort === "Content") return (b.contentRate ?? 0) - (a.contentRate ?? 0);
      if (sort === "Recent form") return (b.recent1000Bb100 ?? -9999) - (a.recent1000Bb100 ?? -9999);
      if (sort === "Public footprint") return ({ Low: 0, Medium: 1, High: 2 }[a.identityRisk]) - ({ Low: 0, Medium: 1, High: 2 }[b.identityRisk]);
      if (a.tier === "Locked") return -1;
      if (b.tier === "Locked") return 1;
      return a.selectionRank - b.selectionRank;
    });
    return ordered;
  }, [query, tier, risk, sort]);

  function toggleShortlist(handle: string) {
    const next = shortlistSet.has(handle) ? shortlisted.filter((item) => item !== handle) : [...shortlisted, handle];
    setShortlisted(next);
    localStorage.setItem("poker-candidate-shortlist", JSON.stringify(next));
  }

  return (
    <main id="top" className="candidate-page">
      <header className="topbar candidate-topbar">
        <a className="brand" href="/candidates"><span className="brand-mark">A</span><span>ARENA / CANDIDATE ROOM</span></a>
        <div className="topbar-meta"><a className="pool-link" href="/">8-PLAYER CLIP ROOM ↗</a><span>INTERNAL</span><span>30 PLAYERS</span></div>
      </header>

      <section className="candidate-hero">
        <div className="candidate-hero-copy">
          <span className="section-kicker">FINAL TABLE · SELECTION WORKSPACE</span>
          <h1>Thirty players.<br /><em>One final table.</em></h1>
          <p>Compare competitive strength, cross-format history, clip potential, operating samples and public-account depth. Composite rank is only a screening order—not the final decision.</p>
        </div>
        <div className="candidate-summary">
          <div><span>Pool</span><strong>30</strong></div>
          <div><span>Your shortlist</span><strong>{shortlisted.length}</strong></div>
          <div><span>X account review</span><strong>{candidates.filter((candidate) => candidate.identityRisk !== "Low").length}</strong><small>flagged</small></div>
          <div><span>Data refreshed</span><strong>JUL 16</strong><small>17:11 CST</small></div>
        </div>
      </section>

      <aside className="data-warning">
        <span>READ THIS FIRST</span>
        <p>Jul 15 is a snapshot baseline; Jul 16 is the current snapshot, not a full trend. Treat live HU rank as one signal. X alt signal measures public-account footprint only: Low does not mean builder identity is verified. All builder links still require confirmation.</p>
      </aside>

      <section className="candidate-controls">
        <label className="candidate-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agent, builder, handle or style" /></label>
        <select value={tier} onChange={(event) => setTier(event.target.value)} aria-label="Filter by tier">{tierOptions.map((option) => <option key={option}>{option}</option>)}</select>
        <select value={risk} onChange={(event) => setRisk(event.target.value)} aria-label="Filter by identity risk">{riskOptions.map((option) => <option key={option}>{option}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort candidates">
          {['Composite rank', 'Current HU rank', 'Tournament', 'Content', 'Recent form', 'Public footprint'].map((option) => <option key={option}>{option}</option>)}
        </select>
        <span className="visible-count">{visible.length} visible</span>
      </section>

      <section className="candidate-grid" aria-label="Candidate comparison">
        {visible.map((candidate) => {
          const picked = shortlistSet.has(candidate.handle);
          const rankMovement = candidate.previousHuRank && candidate.huRank ? candidate.huRank - candidate.previousHuRank : null;
          return (
            <article className={`candidate-card ${picked ? "picked" : ""}`} key={candidate.handle}>
              <div className="candidate-card-head">
                <div className="candidate-avatar"><span>{avatarInitials(candidate)}</span><img src={candidate.avatar} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div>
                <div className="candidate-person">
                  <div className="badge-row"><span className={`tier-badge ${tierClass(candidate.tier)}`}>{candidate.tier}</span><span className={`identity-badge ${riskClass(candidate.identityRisk)}`}>{candidate.identityRisk} X alt signal</span></div>
                  <h2>{candidate.name}</h2>
                  <a href={`https://x.com/${candidate.handle}`} target="_blank" rel="noreferrer">{candidate.displayName} · @{candidate.handle} ↗</a>
                </div>
                <button className="shortlist-button" onClick={() => toggleShortlist(candidate.handle)} aria-pressed={picked}><span>{picked ? "★" : "☆"}</span>{picked ? "Selected" : "Shortlist"}</button>
              </div>

              <div className="candidate-style"><span>OBSERVED STYLE</span><strong>{candidate.style}</strong><small>{candidate.bio || "No public profile bio"}</small></div>

              <div className="candidate-metrics">
                <div><span>Screening order</span><strong>{candidate.tier === "Locked" ? "LOCK" : `#${candidate.selectionRank}`}</strong><small>{candidate.selectionScore ? `${fmt(candidate.selectionScore, 1)} composite` : "special entrant"}</small></div>
                <div><span>HU rank now</span><strong>{candidate.huRank ? `#${candidate.huRank}` : "—"}</strong><small>{candidate.previousHuRank ? `Jul 15: #${candidate.previousHuRank}` : "no Jul 15 baseline"}{rankMovement ? ` · ${rankMovement > 0 ? "▼" : "▲"}${Math.abs(rankMovement)}` : ""}</small></div>
                <div><span>HU sample</span><strong>{fmt(candidate.huHistoricalHands)}</strong><small>{fmt(candidate.huScoredHands)} currently scored</small></div>
                <div><span>Recent 1k</span><strong className={(candidate.recent1000Bb100 ?? 0) >= 0 ? "positive" : "negative"}>{signed(candidate.recent1000Bb100)}</strong><small>bb / 100</small></div>
                <div><span>Tournament</span><strong>{candidate.tournamentSeasons} seasons</strong><small>{candidate.tournamentSeasons ? `latest #${candidate.tournamentLatestRank} · best #${candidate.tournamentBestRank} · avg top ${fmt((1 - candidate.tournamentAvgPercentile) * 100, 0)}%` : "no history"}</small></div>
                <div><span>Clip density</span><strong>{candidate.contentGrade}</strong><small>{candidate.contentRate === null || candidate.contentRate === undefined ? "format mismatch" : `${fmt(candidate.contentRate, 1)} automated signals / 1k`}</small></div>
              </div>

              <div className="candidate-evidence">
                <div className="account-evidence">
                  <span>PUBLIC X FOOTPRINT</span>
                  <strong className={riskClass(candidate.identityRisk)}>{candidate.identityRisk} alt signal</strong>
                  <p>{candidate.identityNote}</p>
                  <small>{candidate.followers === null || candidate.followers === undefined ? "followers unavailable" : `${fmt(candidate.followers)} followers`} · {candidate.posts === null || candidate.posts === undefined ? "posts unavailable" : `${fmt(candidate.posts)} posts`}</small>
                </div>
                <div className="ops-evidence">
                  <span>OPS / CONTENT</span>
                  <strong>{candidate.medianDecisionSec ? `${fmt(candidate.medianDecisionSec, 2)}s sampled median` : "No HU timing sample"}</strong>
                  <p>{candidate.sampledTimeoutRate === null || candidate.sampledTimeoutRate === undefined ? "No comparable HU timeout spot-check" : `timeout spot-check: ${fmt(candidate.sampledTimeoutRate * candidate.sampledActions, 0)}/${candidate.sampledActions} sampled actions`}</p>
                  <small>{fmt(candidate.clipCandidateCount)} automated clip candidates · {fmt(candidate.totalObservedHands)} observed hands</small>
                </div>
              </div>

              <details className="candidate-details">
                <summary>Observed poker profile</summary>
                <div><span>VPIP<strong>{fmt(candidate.vpip * 100, 1)}%</strong></span><span>PFR<strong>{fmt(candidate.pfr * 100, 1)}%</strong></span><span>AF<strong>{fmt(candidate.aggressionFactor, 2)}</strong></span><span>3-BET<strong>{fmt(candidate.threeBetPct * 100, 1)}%</strong></span><span>WSD<strong>{fmt(candidate.showdownWinPct * 100, 1)}%</strong></span><span>Lifetime HU<strong>{signed(candidate.realizedBb100)}</strong></span></div>
              </details>

              <div className="candidate-actions">
                {candidate.topReplayUrl ? <a href={candidate.topReplayUrl} target="_blank" rel="noreferrer">Open top replay <span>↗</span><small>vs {candidate.topReplayOpponent}</small></a> : <span className="disabled-action">No comparable HU replay</span>}
                <a href={`https://x.com/${candidate.handle}`} target="_blank" rel="noreferrer">Review X account <span>↗</span></a>
              </div>
            </article>
          );
        })}
      </section>

      <aside className="data-warning methodology-note">
        <span>SCREENING WEIGHTS</span>
        <p>HU strength 40 · Tournament 25 · reliability signals 15 · realized hand quality 10 · cross-format activity 5 · clip readiness 5. Use the order to narrow the pool, then review the underlying evidence.</p>
      </aside>

      <footer><span>FINAL TABLE · 30-PLAYER CANDIDATE POOL</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
