import preferredData from "./data/preferred-eight.json";

const players = preferredData.players;

function fmt(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export function PreferredEight() {
  const core = players.filter((player) => player.group === "Core 8");
  const bench = players.filter((player) => player.group === "Bench");

  return (
    <main className="preferred-page" id="top">
      <header className="topbar preferred-topbar">
        <a className="brand" href="/preferred-eight"><span className="brand-mark">A</span><span>ARENA / PREFERRED 8</span></a>
        <nav><a href="/">CLIP ROOM</a><a href="/candidates">FULL POOL</a></nav>
      </header>

      <section className="preferred-hero">
        <span className="section-kicker">FINALIST DECISION · FAST REVIEW</span>
        <h1>Eight make sense.<br /><em>Two deserve a look.</em></h1>
        <div className="preferred-hero-bottom">
          <p>{preferredData.summary}</p>
          <div><strong>8</strong><span>preferred</span><strong>2</strong><span>bench</span><strong>30</strong><span>replays</span></div>
        </div>
      </section>

      <section className="preferred-decision">
        <div><span>RECOMMENDATION</span><strong>Keep the proposed eight as the working finalist list.</strong></div>
        <div><span>ONLY TWO TO COMPARE</span><strong>izie for ranking strength · KumaZero for all-round proof.</strong></div>
        <small>Night Owl is not promoted despite stronger current HU placement because the public account is extremely thin and there is no Tournament history.</small>
      </section>

      <section className="preferred-jump" aria-label="Jump to player">
        {[...core, ...bench].map((player) => <a key={player.candidate.handle} href={`#${player.candidate.handle.toLowerCase()}`}><span>{String(player.order).padStart(2, "0")}</span>{player.candidate.name === "Thaddius" ? "Thaddius / Field" : player.candidate.name}</a>)}
      </section>

      <section className="preferred-list">
        {[...core, ...bench].map((player) => {
          const candidate = player.candidate;
          return (
            <article className={`preferred-player ${player.group === "Bench" ? "preferred-bench" : ""}`} id={candidate.handle.toLowerCase()} key={candidate.handle}>
              <div className="preferred-player-head">
                <span className="preferred-order">{String(player.order).padStart(2, "0")}</span>
                <img src={candidate.avatar} alt="" />
                <div className="preferred-identity">
                  <div><span className="preferred-group">{player.group}</span>{candidate.businessLock ? <span className="lock-badge">BUSINESS LOCK</span> : null}</div>
                  <h2>{candidate.name === "Thaddius" ? "Thaddius / Field" : candidate.name}</h2>
                  <a href={`https://x.com/${candidate.handle}`} target="_blank" rel="noreferrer">@{candidate.handle} ↗</a>
                </div>
                <div className="preferred-verdict"><span>{player.verdict}</span><p>{player.rationale}</p></div>
              </div>

              <div className="preferred-metrics">
                <div><span>Screening</span><strong>{candidate.selectionRank ? `#${candidate.selectionRank}` : "LOCK"}</strong><small>{candidate.selectionScore ? `${fmt(candidate.selectionScore, 1)} history-aware` : "Tournament entrant"}</small></div>
                <div><span>Current HU</span><strong>{candidate.huRank ? `#${candidate.huRank}` : "—"}</strong><small>peak {fmt(candidate.historicalPeakScore, 1)}</small></div>
                <div><span>Tournament</span><strong>{candidate.tournamentSeasons} seasons</strong><small>best #{fmt(candidate.tournamentBestRank)} · latest #{fmt(candidate.tournamentLatestRank)}</small></div>
                <div><span>Content signal</span><strong>{candidate.contentGrade}</strong><small>{fmt(candidate.clipCandidateCount)} automated signals</small></div>
                <div><span>X footprint</span><strong className={`preferred-risk preferred-risk-${candidate.identityRisk.toLowerCase()}`}>{candidate.identityRisk}</strong><small>builder linkage unverified</small></div>
              </div>

              <div className="preferred-clips">
                {player.clips.map((clip, clipIndex) => (
                  <a href={clip.replayUrl} target="_blank" rel="noreferrer" className="preferred-clip" key={clip.replayId}>
                    <div><span>CLIP {clipIndex + 1}</span><em>{clip.label}</em><b>OPEN REPLAY ↗</b></div>
                    <h3>{clip.cards || "Cards hidden"} <small>vs {clip.opponent}</small></h3>
                    <p>{clip.highlight}</p>
                    <footer><span>{clip.board || "No full board"}</span><strong>{clip.result}</strong></footer>
                  </a>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <aside className="preferred-method">
        <span>HOW TO USE THIS PAGE</span>
        <p>Review the three internal screening hands per agent, then decide only whether izie or KumaZero clearly displaces someone in the Core 8. These are diagnostic replays—not the final outward-facing highlight reel. Screening rank is history-aware evidence, not a rebuilt official leaderboard.</p>
      </aside>

      <footer className="preferred-footer"><span>DATA CUT · {preferredData.asOf}</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
