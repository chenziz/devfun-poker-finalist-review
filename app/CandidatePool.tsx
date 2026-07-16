"use client";

import { useEffect, useMemo, useState } from "react";
import candidateData from "./data/candidates.json";

type Candidate = {
  selectionRank: number;
  tier: string;
  businessLock?: boolean;
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
  analyzedHandCount?: number | null;
  historicalPeakScore?: number | null;
  historicalMaxRunHands?: number | null;
  platformBestRank?: number | null;
  versionCount?: number | null;
  eligible20kRuns?: number | null;
  positiveRunRate?: number | null;
  rankRegression?: number | null;
  scoreRegression?: number | null;
  observedRuns?: Array<{
    source: string;
    score?: number | null;
    hands: number;
    createdAt?: string | null;
    status: string;
    submissionId?: string | null;
    eligible20k: boolean;
  }>;
  scoreComponents?: Record<string, number>;
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
  vpip?: number | null;
  pfr?: number | null;
  aggressionFactor?: number | null;
  threeBetPct?: number | null;
  showdownWinPct?: number | null;
  topReplayId?: string | null;
  topReplayUrl?: string | null;
  topReplayOpponent?: string | null;
  topReplayResult?: number | string | null;
};

const candidates = candidateData.candidates as Candidate[];
const tierOptions = ["All tiers", "Locked", "Shortlist", "Strong backup", "Review", "Longshot", "History review"];
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
      if (sort === "Historical peak") return (b.historicalPeakScore ?? -999) - (a.historicalPeakScore ?? -999);
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
        <div className="topbar-meta"><a className="pool-link" href="/finalist-highlights">80-HAND REVIEW ↗</a><a className="pool-link" href="/preferred-eight">PREFERRED 8 ↗</a><span>30 RANKED + 2 REVIEW</span></div>
      </header>

      <section className="candidate-hero">
        <div className="candidate-hero-copy">
          <span className="section-kicker">FINAL TABLE · SELECTION WORKSPACE</span>
          <h1>Thirty players.<br /><em>One final table.</em></h1>
          <p>Compare every observed HU run—not only the version currently occupying the leaderboard—with Tournament history, content potential, operating samples and public-account depth.</p>
        </div>
        <div className="candidate-summary">
          <div><span>Ranked pool</span><strong>30</strong></div>
          <div><span>Your shortlist</span><strong>{shortlisted.length}</strong></div>
          <div><span>X account review</span><strong>{candidates.filter((candidate) => candidate.identityRisk !== "Low").length}</strong><small>flagged</small></div>
          <div><span>Business locks</span><strong>2</strong><small>TheAAI + Field</small></div>
        </div>
      </section>

      <aside className="data-warning">
        <span>READ THIS FIRST</span>
        <p>History-aware screening: submission-level AWS records through Jul 3 + Jul 15 public snapshot + current public data at Jul 16, 17:45 CST. This is not a rebuilt leaderboard. Later run history is reconstructed from observed snapshots, so missing history is marked rather than invented. Ranks #8–9 are effectively tied and need manual review.</p>
      </aside>

      <section className="candidate-controls">
        <label className="candidate-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agent, builder, handle or style" /></label>
        <select value={tier} onChange={(event) => setTier(event.target.value)} aria-label="Filter by tier">{tierOptions.map((option) => <option key={option}>{option}</option>)}</select>
        <select value={risk} onChange={(event) => setRisk(event.target.value)} aria-label="Filter by identity risk">{riskOptions.map((option) => <option key={option}>{option}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort candidates">
          {['Composite rank', 'Historical peak', 'Current HU rank', 'Tournament', 'Content', 'Recent form', 'Public footprint'].map((option) => <option key={option}>{option}</option>)}
        </select>
        <span className="visible-count">{visible.length} visible</span>
      </section>

      <aside className="candidate-stat-key" aria-label="How to read candidate statistics">
        <strong>HOW TO READ THE NUMBERS</strong>
        <span><b>RANK</b> place among agents</span>
        <span><b>SCORE</b> platform HU performance metric</span>
        <span><b>HANDS</b> size of the observed sample</span>
        <span><b>20K+</b> a fully eligible completed run</span>
      </aside>

      <section className="candidate-grid" aria-label="Candidate comparison">
        {visible.map((candidate) => {
          const picked = shortlistSet.has(candidate.handle);
          const rankMovement = candidate.previousHuRank && candidate.huRank ? candidate.huRank - candidate.previousHuRank : null;
          return (
            <article className={`candidate-card ${picked ? "picked" : ""}`} key={candidate.handle}>
              <div className="candidate-card-head">
                <div className="candidate-avatar"><span>{avatarInitials(candidate)}</span><img src={candidate.avatar} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div>
                <div className="candidate-person">
                  <div className="badge-row"><span className={`tier-badge ${tierClass(candidate.tier)}`}>{candidate.tier}</span>{candidate.businessLock ? <span className="lock-badge">BUSINESS LOCK</span> : null}<span className={`identity-badge ${riskClass(candidate.identityRisk)}`}>{candidate.identityRisk} X alt signal</span></div>
                  <h2>{candidate.name}</h2>
                  <a href={`https://x.com/${candidate.handle}`} target="_blank" rel="noreferrer">{candidate.displayName} · @{candidate.handle} ↗</a>
                </div>
                <button className="shortlist-button" onClick={() => toggleShortlist(candidate.handle)} aria-pressed={picked}><span>{picked ? "★" : "☆"}</span>{picked ? "Selected" : "Shortlist"}</button>
              </div>

              <div className="candidate-style"><span>OBSERVED STYLE</span><strong>{candidate.style}</strong><small>{candidate.bio || "No public profile bio"}</small></div>

              <div className="candidate-metrics">
                <div><span>Our screening rank</span><strong>{candidate.tier === "Locked" ? "LOCK" : `#${candidate.selectionRank}`}</strong><small>{candidate.selectionScore ? `Score ${fmt(candidate.selectionScore, 1)} · history-aware` : "Special entrant"}</small></div>
                <div><span>Best observed HU score</span><strong>{candidate.historicalPeakScore === null || candidate.historicalPeakScore === undefined ? "—" : fmt(candidate.historicalPeakScore, 1)}</strong><small>{candidate.platformBestRank ? `Best platform rank #${candidate.platformBestRank}` : "No HU history"} · longest run {fmt(candidate.historicalMaxRunHands)} hands</small></div>
                <div><span>Current leaderboard rank</span><strong>{candidate.huRank ? `#${candidate.huRank}` : "—"}</strong><small>Score {fmt(candidate.huTrueSkill, 1)} across {fmt(candidate.huScoredHands)} hands</small></div>
                <div><span>Rank on Jul 15</span><strong>{candidate.previousHuRank ? `#${candidate.previousHuRank}` : "—"}</strong><small>{rankMovement ? `${rankMovement > 0 ? "Down" : "Up"} ${Math.abs(rankMovement)} places since snapshot` : "No comparable snapshot"}</small></div>
                <div><span>Tournament history</span><strong>{candidate.tournamentSeasons} seasons</strong><small>{candidate.tournamentSeasons ? `Best finish #${candidate.tournamentBestRank} · latest #${candidate.tournamentLatestRank}` : "No Tournament history"}</small></div>
                <div><span>Observed HU history</span><strong>{fmt(candidate.versionCount)} versions</strong><small>{fmt(candidate.huHistoricalHands)} total hands · {fmt(candidate.eligible20kRuns)} completed 20K+</small></div>
              </div>

              <div className="candidate-evidence">
                <div className="account-evidence history-evidence">
                  <span>CURRENT VS HISTORY</span>
                  <strong className={(candidate.scoreRegression ?? 0) < -25 ? "negative" : "positive"}>{candidate.scoreRegression === null || candidate.scoreRegression === undefined ? "No HU comparison" : `${signed(candidate.scoreRegression, 1)} current vs peak`}</strong>
                  <p>{candidate.rankRegression && candidate.rankRegression > 20 ? `Current-only ranking understates this agent by ${candidate.rankRegression} places versus its best observed rank.` : "Current and historical evidence are broadly aligned, or the history sample is limited."}</p>
                  <small>{candidate.positiveRunRate === null || candidate.positiveRunRate === undefined ? "run consistency unavailable" : `${fmt(candidate.positiveRunRate * 100, 0)}% positive observed runs`} · peak {fmt(candidate.historicalPeakScore, 1)}</small>
                </div>
                <div className="ops-evidence">
                  <span>RELIABILITY SAMPLE</span>
                  <strong>{candidate.medianDecisionSec ? `${fmt(candidate.medianDecisionSec, 2)}s sampled median` : "No HU timing sample"}</strong>
                  <p>{candidate.sampledTimeoutRate === null || candidate.sampledTimeoutRate === undefined ? "No comparable HU timeout spot-check" : `timeout spot-check: ${fmt(candidate.sampledTimeoutRate * candidate.sampledActions, 0)}/${candidate.sampledActions} sampled actions`}</p>
                  <small>{fmt(candidate.clipCandidateCount)} automated clip signals · {fmt(candidate.analyzedHandCount)} hands analyzed</small>
                </div>
                <div className="account-evidence">
                  <span>PUBLIC ACCOUNT CHECK</span>
                  <strong className={riskClass(candidate.identityRisk)}>{candidate.identityRisk} alt signal</strong>
                  <p>{candidate.identityNote}</p>
                  <small>{candidate.followers === null || candidate.followers === undefined ? "followers unavailable" : `${fmt(candidate.followers)} followers`} · {candidate.posts === null || candidate.posts === undefined ? "posts unavailable" : `${fmt(candidate.posts)} posts`}</small>
                </div>
              </div>

              <details className="candidate-details">
                <summary>Observed runs & poker profile</summary>
                <div><span>Hands played (VPIP)<strong>{candidate.vpip === null || candidate.vpip === undefined ? "—" : `${fmt(candidate.vpip * 100, 1)}%`}</strong></span><span>Raises preflop (PFR)<strong>{candidate.pfr === null || candidate.pfr === undefined ? "—" : `${fmt(candidate.pfr * 100, 1)}%`}</strong></span><span>Aggression factor<strong>{fmt(candidate.aggressionFactor, 2)}</strong></span><span>Re-raises (3-bet)<strong>{candidate.threeBetPct === null || candidate.threeBetPct === undefined ? "—" : `${fmt(candidate.threeBetPct * 100, 1)}%`}</strong></span><span>Showdown win rate<strong>{candidate.showdownWinPct === null || candidate.showdownWinPct === undefined ? "—" : `${fmt(candidate.showdownWinPct * 100, 1)}%`}</strong></span><span>Recent 1K (bb/100)<strong>{signed(candidate.recent1000Bb100)}</strong></span></div>
                {candidate.observedRuns && candidate.observedRuns.length > 0 ? <div className="run-history">{candidate.observedRuns.map((run, index) => <span key={`${run.source}-${index}`}><small>{run.source}</small><strong>{fmt(run.score, 1)}</strong><em>{fmt(run.hands)} hands · {run.eligible20k ? "20K+" : "provisional"}</em></span>)}</div> : null}
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
        <p>Historical HU 35 · current HU 10 · HU history depth 10 · cross-version consistency 5 · Tournament 20 · realized quality 5 · reliability 10 · clip readiness 5. This order is for screening; inspect the runs before locking finalists.</p>
      </aside>

      <footer><span>FINAL TABLE · HISTORY-CORRECTED CANDIDATE POOL</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
