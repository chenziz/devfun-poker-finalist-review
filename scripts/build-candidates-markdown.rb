require "json"

root = File.expand_path("..", __dir__)
data = JSON.parse(File.read(File.join(root, "app/data/candidates.json")))

def value(number, digits = 1, suffix = "")
  return "—" if number.nil?
  "#{format("%.#{digits}f", number)}#{suffix}"
end

def integer(number)
  number.nil? ? "—" : number.to_i.to_s.reverse.scan(/.{1,3}/).join(",").reverse
end

def link(label, url)
  url ? "[#{label}](#{url})" : "—"
end

rows = data.fetch("candidates").map do |candidate|
  rank = candidate.fetch("selectionRank")
  rank_label = rank.zero? ? "Locked" : rank.to_s
  x = link("@#{candidate.fetch("handle")}", "https://x.com/#{candidate.fetch("handle")}")
  replay = link("Replay", candidate["topReplayUrl"])
  [
    rank_label,
    candidate.fetch("name"),
    x,
    candidate.fetch("tier"),
    value(candidate["selectionScore"]),
    candidate["huRank"] || "—",
    integer(candidate["huScoredHands"]),
    integer(candidate["huHistoricalHands"]),
    candidate["tournamentSeasons"] || 0,
    candidate["tournamentBestRank"] || "—",
    value(candidate["realizedBb100"]),
    value(candidate["recent1000Bb100"]),
    value(candidate["reliability"] && candidate["reliability"] * 100, 1, "%"),
    candidate["contentGrade"] || "—",
    candidate["identityRisk"] || "—",
    candidate["style"] || "—",
    replay,
  ]
end

headers = ["Rank", "Candidate", "Builder / X", "Tier", "History score", "Current HU rank", "Current HU hands", "Historical HU hands", "T seasons", "T best", "Lifetime bb/100", "Recent 1k bb/100", "Reliability", "Content", "Identity risk", "Style", "Replay"]

lines = []
lines << "# Arena Poker Candidate Data"
lines << ""
lines << "Public Arena snapshot: **#{data.fetch("asOfPublic")}**  "
lines << "Candidates: **#{data.fetch("candidates").length}** (#{data.fetch("rankedCount")} ranked, plus locked/history-review entries)"
lines << ""
lines << "> This is the Markdown view of [`app/data/candidates.json`](app/data/candidates.json). The JSON file remains the website source of truth. Identity-risk labels are screening signals, not proof of identity."
lines << ""
lines << "## Candidate table"
lines << ""
lines << "| #{headers.join(" | ")} |"
lines << "|#{headers.map { "---" }.join("|")}|"
rows.each { |row| lines << "| #{row.join(" | ")} |" }
lines << ""
lines << "## Field definitions"
lines << ""
lines << "- **History score:** history-aware screening score combining HU history, Tournament record, realized results, reliability and content readiness."
lines << "- **Current HU hands:** hands counted in the currently displayed Heads-Up Ladder submission."
lines << "- **Historical HU hands:** deduplicated public HU tables collected across observed submissions/versions."
lines << "- **Lifetime / recent bb/100:** descriptive results reconstructed from public hand chip deltas; recent results are high variance."
lines << "- **Reliability:** operational screening score derived from volume, sampled timeout evidence and historical completion evidence."
lines << "- **Identity risk:** manual/X-account screening only. Builder identity still requires direct confirmation."
lines << ""
lines << "## Arena public data endpoints"
lines << ""
lines << "The underlying public data comes from `https://arena.dev.fun/api/`:"
lines << ""
lines << "- `arena.listArenas`"
lines << "- `arena.getLeaderboard`"
lines << "- `arena.getAgentTexasStats`"
lines << "- `arena.getTexasTables`"
lines << "- `arena.getTexasReplay`"
lines << ""
lines << "Rebuild this file after editing the candidate JSON:"
lines << ""
lines << "```bash"
lines << "ruby scripts/build-candidates-markdown.rb"
lines << "```"

File.write(File.join(root, "CANDIDATES.md"), lines.join("\n") + "\n")
