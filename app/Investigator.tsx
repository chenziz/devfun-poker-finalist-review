"use client";

import { useEffect, useMemo, useState } from "react";
import clipsData from "./data/clips.json";

type Clip = {
  player: string;
  usage: string;
  clip_type: string;
  replay_id: string;
  replay_url: string;
  hero_cards: string;
  opponent: string;
  board: string;
  result: string;
  clip_highlight: string;
  action_summary: string;
};

type Profile = {
  key: string;
  agent: string;
  displayName: string;
  handle: string;
  avatar: string;
  bio: string;
  followers?: number;
  style: string;
  metrics: string;
  sample: string;
  accent: string;
  accountCreated: string;
  xStats: string;
  lastActivity: string;
  altLikelihood: "Low" | "Medium" | "High";
  accountSignals: string[];
};

const profiles: Profile[] = [
  {
    key: "Field / Thaddius",
    agent: "Field / Thaddius",
    displayName: "Fielding Johnston",
    handle: "justfielding",
    avatar: "/avatars/field.png",
    bio: "Smol Biological Neural Network for Uncensored Pontification",
    followers: 261,
    style: "Tight entry followed by extreme commitment",
    metrics: "44.1 / 34.0 / 3.92 / 11.6 / 64.7",
    sample: "Heads-Up Ladder",
    accent: "#d9ff59",
    accountCreated: "Creation date unavailable",
    xStats: "261 followers · 604 following · 1,340 posts",
    lastActivity: "Active Jul 2026",
    altLikelihood: "Low",
    accountSignals: ["Substantial post history", "Recent original technical discussion", "Public identity appears consistent"],
  },
  {
    key: "TheAAI / AlphaHorizon",
    agent: "TheAAI / AlphaHorizon",
    displayName: "Adam Roy Hirschfeld",
    handle: "AlphaHorizon",
    avatar: "/avatars/alphahorizon.jpg",
    bio: "TheAAI builder and AlphaHorizon on X",
    followers: 2,
    style: "Six-max TAG with check-raise leverage",
    metrics: "34.3 / 28.3 / 3.66 / 13.9 / 55.0",
    sample: "Tournament S5",
    accent: "#8cc8ff",
    accountCreated: "Joined May 2010",
    xStats: "2 followers · 2 following · 3 posts",
    lastActivity: "No recent posts found",
    altLikelihood: "High",
    accountSignals: ["Extremely sparse account", "No bio or recent activity", "Old creation date but little organic history"],
  },
  {
    key: "Antge Poker Bot",
    agent: "Antge Poker Bot",
    displayName: "antgeo",
    handle: "antgeo13",
    avatar: "/avatars/antge.jpg",
    bio: "Nads / monartist · building Monuki",
    followers: 3095,
    style: "Selective pressure followed by price control",
    metrics: "68.1 / 32.5 / 1.34 / 6.6 / 53.1",
    sample: "Heads-Up Ladder",
    accent: "#ff916e",
    accountCreated: "Creation date unavailable",
    xStats: "3,095 followers · 1,212 following · 12,940 posts",
    lastActivity: "Active Jul 2026",
    altLikelihood: "Low",
    accountSignals: ["Large established history", "Very recent ongoing activity", "Profile and ecosystem identity are consistent"],
  },
  {
    key: "Grinder",
    agent: "Grinder",
    displayName: "F O X",
    handle: "foxthegrinder",
    avatar: "/avatars/grinder.jpg",
    bio: "Exploit the exploiters",
    followers: 142,
    style: "Loose-aggressive pressure engine with the highest 3-bet rate",
    metrics: "83.8 / 53.2 / 2.30 / 25.5 / 46.1",
    sample: "Heads-Up Ladder",
    accent: "#ffce73",
    accountCreated: "Joined Jun 2012",
    xStats: "142 followers · 58 following · 2,739 posts",
    lastActivity: "Posted to @devfun Jul 2026",
    altLikelihood: "Medium",
    accountSignals: ["Long-lived account", "Current profile appears recently repurposed", "Only two retrievable timeline posts; manual check recommended"],
  },
  {
    key: "Junglist Soldier",
    agent: "Junglist Soldier",
    displayName: "Tom Gosling",
    handle: "tomgosling",
    avatar: "/avatars/junglist.jpg",
    bio: "I eat bad beats for breakfast",
    followers: 147,
    style: "Patient, showdown-oriented, and equity-led",
    metrics: "58.7 / 23.3 / 1.08 / 10.4 / 60.6",
    sample: "Heads-Up Ladder",
    accent: "#b99aff",
    accountCreated: "Joined Apr 2022",
    xStats: "147 followers · 1,936 following · 1,066 posts",
    lastActivity: "Active Jul 2026",
    altLikelihood: "Low",
    accountSignals: ["Multi-year organic activity", "Recent poker-agent research posts", "Name and technical interests are coherent"],
  },
  {
    key: "dein Joni",
    agent: "dein Joni",
    displayName: "DeinJoni aka Younes",
    handle: "DeinJoni",
    avatar: "/avatars/deinjoni.jpg",
    bio: "Busy building · grinding pokah…",
    followers: 175,
    style: "Raise-first poker with rapid postflop acceleration",
    metrics: "79.3 / 65.1 / 3.69 / 15.4 / 50.3",
    sample: "Heads-Up Ladder",
    accent: "#f394db",
    accountCreated: "Joined Sep 2020",
    xStats: "175 followers · 683 following · 552 posts",
    lastActivity: "Active Mar 2026",
    altLikelihood: "Low",
    accountSignals: ["Multi-year posting history", "Organic crypto and location trail", "Agent name closely matches the handle"],
  },
  {
    key: "Night Owl",
    agent: "Night Owl",
    displayName: "Tom Ng",
    handle: "xsysra",
    avatar: "/avatars/nightowl.jpg",
    bio: "Fold is free. Information is not.",
    style: "Selective starting ranges with strong late-street decisions",
    metrics: "57.9 / 38.9 / 1.74 / 5.7 / 62.4",
    sample: "Heads-Up Ladder",
    accent: "#70e7d1",
    accountCreated: "Joined Jun 2026",
    xStats: "Followers hidden/unavailable · 16 following",
    lastActivity: "No public posts found",
    altLikelihood: "High",
    accountSignals: ["Account is about one month old", "No public timeline history found", "Builder-to-agent linkage needs direct confirmation"],
  },
  {
    key: "Whale Alert",
    agent: "Whale Alert",
    displayName: "dahlia rania syazania",
    handle: "DSyazaniaranisy",
    avatar: "/avatars/whalealert.jpg",
    bio: "Splash incoming, clear the pool",
    style: "An almost any-two-cards style with exceptional stickiness",
    metrics: "92.9 / 21.6 / 0.50 / 14.4 / 56.7",
    sample: "Heads-Up Ladder",
    accent: "#65c6ff",
    accountCreated: "Joined Feb 2026",
    xStats: "Followers hidden/unavailable · 2 following · 1 post",
    lastActivity: "No recent posts found",
    altLikelihood: "High",
    accountSignals: ["Very new and extremely sparse", "No bio or public activity trail", "Builder-to-agent linkage needs direct confirmation"],
  },
];

const allClips = clipsData as Clip[];
const usageOptions = ["All", "Primary", "Secondary", "Quick cut", "Research"];
const suits: Record<string, string> = { h: "♥", d: "♦", c: "♣", s: "♠" };

function altClass(value: Profile["altLikelihood"]) {
  return `alt-${value.toLowerCase()}`;
}

function isRedCard(card: string) {
  return /[hd]$/i.test(card);
}

function PlayingCards({ value, compact = false }: { value: string; compact?: boolean }) {
  const cards = value.split(/\s+/).filter(Boolean);
  if (!cards.length) return <span className="muted">No board</span>;
  return (
    <span className={`playing-cards ${compact ? "compact" : ""}`}>
      {cards.map((card) => (
        <span className={`playing-card ${isRedCard(card) ? "red" : ""}`} key={card}>
          {card.slice(0, -1)}
          <small>{suits[card.slice(-1).toLowerCase()]}</small>
        </span>
      ))}
    </span>
  );
}

export function Investigator() {
  const [query, setQuery] = useState("");
  const [usage, setUsage] = useState("All");
  const [activePlayer, setActivePlayer] = useState("All players");
  const [reviewed, setReviewed] = useState<string[]>([]);

  useEffect(() => {
    try {
      setReviewed(JSON.parse(localStorage.getItem("poker-reviewed-clips") || "[]"));
    } catch {
      setReviewed([]);
    }
  }, []);

  const reviewedSet = useMemo(() => new Set(reviewed), [reviewed]);
  const visibleProfiles = activePlayer === "All players" ? profiles : profiles.filter((profile) => profile.key === activePlayer);

  function toggleReviewed(id: string) {
    const next = reviewedSet.has(id) ? reviewed.filter((item) => item !== id) : [...reviewed, id];
    setReviewed(next);
    localStorage.setItem("poker-reviewed-clips", JSON.stringify(next));
  }

  function matches(clip: Clip) {
    const text = `${clip.player} ${clip.usage} ${clip.clip_type} ${clip.hero_cards} ${clip.opponent} ${clip.board} ${clip.result} ${clip.clip_highlight}`.toLowerCase();
    return (usage === "All" || clip.usage === usage) && (!query || text.includes(query.toLowerCase()));
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Back to top">
          <span className="brand-mark">A</span>
          <span>ARENA / CLIP ROOM</span>
        </a>
        <div className="topbar-meta">
          <span>INTERNAL</span>
          <span>8 AGENTS</span>
          <span>80 HANDS</span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> FINAL TABLE · STREAMING RESEARCH</div>
        <h1>Know the players.<br /><em>Find the moments.</em></h1>
        <p className="hero-copy">One visual workspace for reviewing the eight finalists, understanding each agent’s identity, and opening every candidate hand directly in Arena.</p>
        <div className="hero-stats">
          <div><strong>8</strong><span>Finalists</span></div>
          <div><strong>80</strong><span>Replay links</span></div>
          <div><strong>{reviewed.length}</strong><span>Reviewed</span></div>
          <div><strong>{Math.round((reviewed.length / 80) * 100)}%</strong><span>Complete</span></div>
        </div>
      </section>

      <section className="profile-grid" aria-label="Finalist overview">
        {profiles.map((profile, index) => (
          <button
            className="profile-card"
            key={profile.key}
            onClick={() => {
              setActivePlayer(profile.key);
              window.setTimeout(() => document.getElementById("hands")?.scrollIntoView({ behavior: "smooth" }), 0);
            }}
            style={{ "--accent": profile.accent } as React.CSSProperties}
          >
            <span className="profile-topline"><span className={`alt-badge ${altClass(profile.altLikelihood)}`}>{profile.altLikelihood} alt signal</span><span className="profile-index">0{index + 1}</span></span>
            <img src={profile.avatar} alt={`${profile.displayName} profile`} />
            <span className="profile-copy">
              <span className="agent-name">{profile.agent}</span>
              <strong>{profile.displayName}</strong>
              <span className="handle">@{profile.handle}</span>
            </span>
            <span className="card-arrow">↘</span>
          </button>
        ))}
      </section>

      <section className="workspace" id="hands">
        <div className="workspace-heading">
          <div>
            <span className="section-kicker">INVESTIGATION WORKSPACE</span>
            <h2>Replay board</h2>
          </div>
          <div className="progress-wrap" aria-label={`${reviewed.length} of 80 clips reviewed`}>
            <div className="progress-copy"><span>Review progress</span><strong>{reviewed.length} / 80</strong></div>
            <div className="progress-track"><span style={{ width: `${(reviewed.length / 80) * 100}%` }} /></div>
          </div>
        </div>

        <div className="controls">
          <label className="search">
            <span>⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search hand, opponent, board, or highlight" />
          </label>
          <div className="filter-row" role="group" aria-label="Filter by clip usage">
            {usageOptions.map((option) => (
              <button className={usage === option ? "active" : ""} onClick={() => setUsage(option)} key={option}>{option}</button>
            ))}
          </div>
          <select value={activePlayer} onChange={(event) => setActivePlayer(event.target.value)} aria-label="Filter by player">
            <option>All players</option>
            {profiles.map((profile) => <option key={profile.key}>{profile.key}</option>)}
          </select>
        </div>

        {visibleProfiles.map((profile, profileIndex) => {
          const playerClips = allClips.filter((clip) => clip.player === profile.key && matches(clip));
          if (!playerClips.length) return null;
          return (
            <article className="player-section" key={profile.key} style={{ "--accent": profile.accent } as React.CSSProperties}>
              <div className="player-header">
                <div className="player-identity">
                  <img src={profile.avatar} alt="" />
                  <div>
                    <span className="ordinal">PLAYER {String(profiles.indexOf(profile) + 1).padStart(2, "0")}</span>
                    <h3>{profile.agent}</h3>
                    <a href={`https://x.com/${profile.handle}`} target="_blank" rel="noreferrer">{profile.displayName} · @{profile.handle} ↗</a>
                  </div>
                </div>
                <div className="player-note"><span>STYLE READ</span><strong>{profile.style}</strong><p>{profile.bio}</p></div>
                <div className="metrics"><span>VPIP / PFR / AF / 3B / WSD</span><strong>{profile.metrics}</strong><small>{profile.sample}{profile.followers !== undefined ? ` · ${profile.followers.toLocaleString()} X followers` : ""}</small></div>
                <div className="account-check">
                  <div className="account-check-title"><span>X ACCOUNT CHECK</span><strong className={altClass(profile.altLikelihood)}>{profile.altLikelihood} alt likelihood</strong></div>
                  <p>{profile.accountCreated} · {profile.xStats} · {profile.lastActivity}</p>
                  <ul>{profile.accountSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
                  <small>Heuristic only — verify identity directly before final confirmation.</small>
                </div>
              </div>

              <div className="clip-grid">
                {playerClips.map((clip, index) => {
                  const isReviewed = reviewedSet.has(clip.replay_id);
                  const isPrimary = clip.usage === "Primary";
                  return (
                    <section className={`clip-card ${isPrimary ? "featured" : ""} ${isReviewed ? "reviewed" : ""}`} key={clip.replay_id}>
                      <div className="clip-topline">
                        <span className={`usage usage-${clip.usage.toLowerCase().replace(" ", "-")}`}>{clip.usage}</span>
                        <span className="clip-number">{String(index + 1).padStart(2, "0")}</span>
                        <button className="review-toggle" onClick={() => toggleReviewed(clip.replay_id)} aria-pressed={isReviewed}>
                          <span>{isReviewed ? "✓" : ""}</span>{isReviewed ? "Reviewed" : "Mark reviewed"}
                        </button>
                      </div>
                      <div className="clip-title">
                        <div><span>{clip.clip_type}</span><h4>{clip.hero_cards} <small>vs {clip.opponent}</small></h4></div>
                        <PlayingCards value={clip.hero_cards} />
                      </div>
                      <div className="board-row"><span>BOARD</span><PlayingCards value={clip.board} compact /></div>
                      <p className="highlight">{clip.clip_highlight}</p>
                      <div className="result-row"><span className={clip.result.startsWith("Win") ? "win" : "loss"}>{clip.result}</span><code>{clip.replay_id}</code></div>
                      <details>
                        <summary>Action line</summary>
                        <p>{clip.action_summary}</p>
                      </details>
                      <a className="replay-button" href={clip.replay_url} target="_blank" rel="noreferrer">
                        Open replay <span>↗</span>
                      </a>
                    </section>
                  );
                })}
              </div>
              {profileIndex < visibleProfiles.length - 1 && <div className="section-rule" />}
            </article>
          );
        })}

        {!visibleProfiles.some((profile) => allClips.some((clip) => clip.player === profile.key && matches(clip))) && (
          <div className="empty-state"><span>0</span><h3>No hands match these filters.</h3><button onClick={() => { setQuery(""); setUsage("All"); setActivePlayer("All players"); }}>Reset filters</button></div>
        )}
      </section>

      <footer>
        <span>FINAL TABLE · INTERNAL CLIP INVESTIGATION</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
