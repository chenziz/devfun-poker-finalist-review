require "csv"
require "json"
require "time"

research_dir, output = ARGV
metrics_path = File.join(research_dir, "data/candidate_metrics.csv")
analysis_path = File.join(research_dir, "data/analysis.json")
snapshot_path = File.join(research_dir, "data/public_snapshot.json")

analysis = JSON.parse(File.read(analysis_path))
snapshot = JSON.parse(File.read(snapshot_path))
metrics = CSV.read(metrics_path, headers: true).map(&:to_h)
candidate_by_name = analysis.fetch("candidates").to_h { |candidate| [candidate.fetch("name"), candidate] }

previous_hu_rank = {
  "Antge Poker Bot" => 3, "Grinder" => 1, "Junglist Soldier" => 6,
  "dein Joni" => 2, "Night Owl" => 5, "Stariy physe" => 11,
  "folzterac" => 4, "Whale Alert" => 7, "Okonkwo" => 10,
  "RAB" => 9, "Thaddius" => 24, "KumaZero" => 12,
  "John Juanda" => 14, "Neo Alpha" => 16, "Skyler" => 13,
  "izie" => 18, "Sky Top" => 25, "Mata Elang" => 15,
  "Reaper" => 19, "Warden" => 17, "Si Nekat" => 32,
  "May" => 28, "Raven" => 35, "Nft" => 33, "noob" => 27
}

manual_identity = {
  "thea_ai" => ["Low", "Official THEA account linked directly from the Arena agent profile"],
  "foxthegrinder" => ["Medium", "Long-lived but recently repurposed-looking profile; manual confirmation recommended"],
  "xsysra" => ["High", "Created Jun 2026 with no visible posting history"],
  "dsyazaniaranisy" => ["High", "Created Feb 2026 with one post and minimal network"],
  "xhoanggiang" => ["High", "Old creation date but only one follower, one following and one post"],
  "Sunonphyse" => ["Low", "Established account with direct public DevFun and poker posts"],
  "rektlyf" => ["Low", "Established account with a direct @devfun post"],
  "antgeo13" => ["Low", "Large established account with ongoing public activity"],
  "tomgosling" => ["Low", "Multi-year account with direct poker-agent research posts"],
  "deinjoni" => ["Low", "Multi-year organic history and close agent/handle match"],
  "folzterac444" => ["Low", "Long-lived account with substantial posting history; builder linkage still needs confirmation"]
}

def profile_for(handle)
  candidates = [
    "/tmp/pool-profile-#{handle}.json",
    "/tmp/twitter-#{handle}.json",
    "/tmp/twitter-#{handle.downcase}.json"
  ]
  path = candidates.find { |candidate| File.exist?(candidate) }
  return {} unless path
  raw = JSON.parse(File.read(path))
  raw["data"] || raw
rescue JSON::ParserError
  {}
end

def number(value)
  return nil if value.nil? || value == ""
  Float(value)
end

def integer(value)
  parsed = number(value)
  parsed&.round
end

def style_for(candidate)
  vpip = candidate["vpip"].to_f
  pfr = candidate["pfr"].to_f
  aggression = candidate["aggressionFactor"].to_f
  if vpip >= 0.85 && pfr < 0.35
    "Ultra-loose / sticky"
  elsif pfr >= 0.58
    "Raise-first pressure"
  elsif aggression >= 3.0
    "High-aggression"
  elsif vpip < 0.50
    "Selective / tight"
  elsif aggression < 0.80
    "Passive / call-heavy"
  elsif pfr >= 0.40
    "Loose-aggressive"
  else
    "Balanced / adaptive"
  end
end

def content_grade(rate)
  return "A" if rate >= 120
  return "A−" if rate >= 95
  return "B" if rate >= 75
  return "C" if rate >= 55
  "D"
end

def inferred_identity(profile)
  followers = profile["followersCount"]
  posts = profile["statusesCount"]
  return ["High", "Profile data is missing or unavailable"] if profile["screenName"].nil?
  return ["High", "Extremely thin public footprint"] if followers.to_i <= 5 && posts.to_i <= 5
  return ["Medium", "Limited public posting history; manual confirmation recommended"] if posts.to_i <= 20
  return ["Medium", "Very small public network; manual confirmation recommended"] if followers.to_i <= 15
  ["Low", "Established public footprint; builder linkage still needs confirmation"]
end

def tier_for(rank)
  return "Shortlist" if rank <= 8
  return "Strong backup" if rank <= 16
  return "Review" if rank <= 24
  "Longshot"
end

active_rows = metrics.sort_by { |row| row.fetch("selectionRank").to_i }.first(29).map do |row|
  candidate = candidate_by_name.fetch(row.fetch("name"))
  profile = profile_for(row.fetch("xHandle"))
  identity = manual_identity[row.fetch("xHandle")] || inferred_identity(profile)
  tournament = candidate.fetch("tournamentHistory", [])
  clip = candidate.fetch("clips", []).first
  content_rate = candidate.fetch("contentSignalRatePer1000", 0).to_f
  rank = row.fetch("selectionRank").to_i

  {
    "selectionRank" => rank,
    "tier" => tier_for(rank),
    "name" => row.fetch("name"),
    "handle" => row.fetch("xHandle"),
    "displayName" => profile["name"] || row.fetch("xHandle"),
    "avatar" => "/candidate-avatars/#{row.fetch("xHandle").downcase}.jpg",
    "bio" => profile["description"],
    "followers" => profile["followersCount"],
    "following" => profile["friendsCount"],
    "posts" => profile["statusesCount"],
    "accountCreated" => profile["createdAt"],
    "identityRisk" => identity[0],
    "identityNote" => identity[1],
    "selectionScore" => number(row["selectionScore"]),
    "huRank" => integer(row["huRank"]),
    "previousHuRank" => previous_hu_rank[row.fetch("name")],
    "huTrueSkill" => number(row["huTrueSkill"]),
    "huScoredHands" => integer(row["huHands"]),
    "huHistoricalHands" => integer(row["huHandsCollected"]),
    "realizedBb100" => number(row["realizedBb100"]),
    "recent1000Bb100" => number(row["recent1000Bb100"]),
    "previous1000Bb100" => number(row["previous1000Bb100"]),
    "tournamentSeasons" => integer(row["tournamentSeasons"]),
    "tournamentAvgPercentile" => number(row["tournamentAvgPercentile"]),
    "tournamentBestRank" => tournament.map { |season| season["rank"] }.compact.min,
    "tournamentLatestRank" => tournament.last&.fetch("rank", nil),
    "totalObservedHands" => integer(row["totalHands"]),
    "reliability" => number(row["reliability"]),
    "medianDecisionSec" => number(row["medianDecisionSec"]),
    "sampledTimeoutRate" => number(row["sampledTimeoutRate"]),
    "sampledActions" => integer(row["sampledActions"]),
    "contentRate" => content_rate,
    "contentGrade" => content_grade(content_rate),
    "clipCandidateCount" => integer(row["clipCandidateCount"]),
    "style" => style_for(candidate),
    "vpip" => number(row["vpip"]),
    "pfr" => number(row["pfr"]),
    "aggressionFactor" => number(row["aggressionFactor"]),
    "threeBetPct" => number(row["threeBetPct"]),
    "showdownWinPct" => number(row["showdownWinPct"]),
    "topReplayId" => clip&.fetch("tableId", nil),
    "topReplayUrl" => clip ? "https://arena.dev.fun/headsup-ladder/table/#{clip.fetch("tableId")}" : nil,
    "topReplayOpponent" => clip&.fetch("opponent", nil),
    "topReplayResult" => clip&.fetch("chipDelta", nil)
  }
end

thea_profile = profile_for("thea_ai")
thea_agent = snapshot.fetch("tournamentByAgent").values.find do |agent|
  agent.fetch("xHandle", "").downcase == "thea_ai"
end
thea_tournament = thea_agent.fetch("seasons")
thea_replay = JSON.parse(File.read(File.join(File.dirname(output), "clips.json"))).find do |clip|
  clip["player"] == "AlphaHorizon" && clip["usage"] == "Primary"
end

locked = {
  "selectionRank" => 0,
  "tier" => "Locked",
  "name" => thea_agent.fetch("name", "AlphaHorizon"),
  "handle" => thea_agent.fetch("xHandle", "thea_ai"),
  "displayName" => thea_profile["name"] || "THEA",
  "avatar" => thea_agent["avatar"] || "https://pbs.twimg.com/profile_images/1979134071725760512/xNqDkVog_400x400.png",
  "bio" => thea_agent["quote"] || "AlphaHorizon is a predictive intelligence model for reasoning and forecasting in environments with incomplete and evolving information.",
  "followers" => thea_profile["followersCount"] || 18121,
  "following" => thea_profile["friendsCount"] || 8,
  "posts" => thea_profile["statusesCount"] || 92,
  "accountCreated" => thea_profile["createdAt"] || "Mon Sep 23 18:50:04 +0000 2024",
  "identityRisk" => "Low",
  "identityNote" => "Official THEA account linked directly from the Arena agent profile",
  "selectionScore" => nil,
  "huRank" => nil,
  "previousHuRank" => nil,
  "huTrueSkill" => nil,
  "huScoredHands" => 0,
  "huHistoricalHands" => 0,
  "realizedBb100" => nil,
  "recent1000Bb100" => nil,
  "previous1000Bb100" => nil,
  "tournamentSeasons" => thea_tournament.length,
  "tournamentAvgPercentile" => thea_tournament.sum { |season| season["rankPercentile"] } / thea_tournament.length,
  "tournamentBestRank" => thea_tournament.map { |season| season["rank"] }.min,
  "tournamentLatestRank" => thea_tournament.last["rank"],
  "totalObservedHands" => thea_tournament.sum { |season| season["hands"] },
  "reliability" => nil,
  "medianDecisionSec" => nil,
  "sampledTimeoutRate" => nil,
  "sampledActions" => 0,
  "contentRate" => nil,
  "contentGrade" => "—",
  "clipCandidateCount" => 10,
  "style" => "Six-max TAG / check-raise leverage",
  "vpip" => 0.343,
  "pfr" => 0.283,
  "aggressionFactor" => 3.66,
  "threeBetPct" => 0.139,
  "showdownWinPct" => 0.55,
  "topReplayId" => thea_replay["replay_id"],
  "topReplayUrl" => thea_replay["replay_url"],
  "topReplayOpponent" => thea_replay["opponent"],
  "topReplayResult" => thea_replay["result"]
}

payload = {
  "asOfPublic" => analysis.fetch("asOfPublic"),
  "asOfIdentity" => Time.now.utc.iso8601,
  "method" => analysis.fetch("method"),
  "candidates" => [locked] + active_rows
}
File.write(output, JSON.pretty_generate(payload) + "\n")
