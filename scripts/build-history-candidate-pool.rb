require "json"
require "time"

research_dir, output = ARGV
history = JSON.parse(File.read(File.join(research_dir, "data/history_screening.json")))
analysis = JSON.parse(File.read(File.join(research_dir, "data/analysis.json")))
snapshot = JSON.parse(File.read(File.join(research_dir, "data/public_snapshot.json")))
existing = JSON.parse(File.read(output)).fetch("candidates")
existing_by_handle = existing.to_h { |candidate| [candidate.fetch("handle").downcase, candidate] }
detail_by_id = analysis.fetch("candidates").to_h { |candidate| [candidate.fetch("agentId"), candidate] }

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

def style_for(candidate)
  return "Insufficient observed sample" unless candidate && candidate["vpip"]
  vpip = candidate["vpip"].to_f
  pfr = candidate["pfr"].to_f
  aggression = candidate["aggressionFactor"].to_f
  return "Ultra-loose / sticky" if vpip >= 0.85 && pfr < 0.35
  return "Raise-first pressure" if pfr >= 0.58
  return "High-aggression" if aggression >= 3.0
  return "Selective / tight" if vpip < 0.50
  return "Passive / call-heavy" if aggression < 0.80
  return "Loose-aggressive" if pfr >= 0.40
  "Balanced / adaptive"
end

def content_grade(rate)
  return "—" if rate.nil?
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

manual_identity = {
  "foxthegrinder" => ["Medium", "Long-lived but recently repurposed-looking profile; manual confirmation recommended"],
  "xsysra" => ["High", "Created Jun 2026 with no visible posting history"],
  "dsyazaniaranisy" => ["High", "Created Feb 2026 with one post and minimal network"],
  "xhoanggiang" => ["High", "Old creation date but only one follower, one following and one post"],
  "zeroknowledge0x" => ["Low", "Established public account; builder linkage still requires confirmation"],
}

build_candidate = lambda do |row, special_tier = nil|
  handle = row.fetch("xHandle")
  base = existing_by_handle[handle.downcase] || {}
  profile = profile_for(handle)
  detail = detail_by_id[row.fetch("agentId")]
  identity = if base["identityRisk"]
    [base["identityRisk"], base["identityNote"]]
  else
    manual_identity[handle.downcase] || inferred_identity(profile)
  end
  tournament = snapshot.fetch("tournamentByAgent").fetch(row.fetch("agentId"), { "seasons" => [] }).fetch("seasons")
  clip = detail&.fetch("clips", [])&.first
  content_rate = row["contentSignalRatePer1000"]
  rank = row.fetch("screeningRank")
  avatar_name = handle.downcase

  {
    "selectionRank" => rank,
    "tier" => special_tier || tier_for(rank),
    "businessLock" => handle.downcase == "justfielding",
    "name" => row.fetch("name"),
    "handle" => handle,
    "displayName" => profile["name"] || base["displayName"] || handle,
    "avatar" => "/candidate-avatars/#{avatar_name}.jpg",
    "bio" => profile["description"] || base["bio"],
    "followers" => profile["followersCount"] || base["followers"],
    "following" => profile["friendsCount"] || base["following"],
    "posts" => profile["statusesCount"] || base["posts"],
    "accountCreated" => profile["createdAt"] || base["accountCreated"],
    "identityRisk" => identity[0],
    "identityNote" => identity[1],
    "selectionScore" => row["screeningScore"],
    "huRank" => row["currentRank"],
    "previousHuRank" => row["jul15Rank"],
    "huTrueSkill" => row["currentScore"],
    "huScoredHands" => row["currentHands"],
    "huHistoricalHands" => row["historicalCollectedHands"],
    "analyzedHandCount" => row["analyzedHandCount"],
    "historicalPeakScore" => row["historicalPeakScore"],
    "historicalMaxRunHands" => row["historicalMaxRunHands"],
    "platformBestRank" => row["platformBestRank"],
    "versionCount" => row["versionCountObserved"],
    "eligible20kRuns" => row["eligible20kRunsObserved"],
    "positiveRunRate" => row["positiveRunRate"],
    "rankRegression" => row["rankRegression"],
    "scoreRegression" => row["scoreRegression"],
    "observedRuns" => row["observedRuns"],
    "scoreComponents" => row["scoreComponents"],
    "realizedBb100" => row["realizedBb100"],
    "recent1000Bb100" => row["recent1000Bb100"],
    "previous1000Bb100" => detail&.fetch("previous1000Bb100", nil),
    "tournamentSeasons" => row["tournamentSeasons"],
    "tournamentAvgPercentile" => row["tournamentAvgPercentile"],
    "tournamentBestRank" => row["tournamentBestRank"],
    "tournamentLatestRank" => row["tournamentLatestRank"],
    "totalObservedHands" => row["totalObservedHands"],
    "reliability" => row["reliability"],
    "medianDecisionSec" => row["medianDecisionSec"],
    "sampledTimeoutRate" => row["sampledTimeoutRate"],
    "sampledActions" => row["sampledActions"] || 0,
    "contentRate" => content_rate,
    "contentGrade" => content_grade(content_rate),
    "clipCandidateCount" => row["clipCandidateCount"] || 0,
    "style" => style_for(detail),
    "vpip" => row["vpip"],
    "pfr" => row["pfr"],
    "aggressionFactor" => row["aggressionFactor"],
    "threeBetPct" => row["threeBetPct"],
    "showdownWinPct" => row["showdownWinPct"],
    "topReplayId" => clip&.fetch("tableId", nil) || base["topReplayId"],
    "topReplayUrl" => clip ? "https://arena.dev.fun/headsup-ladder/table/#{clip.fetch("tableId")}" : base["topReplayUrl"],
    "topReplayOpponent" => clip&.fetch("opponent", nil) || base["topReplayOpponent"],
    "topReplayResult" => clip&.fetch("chipDelta", nil) || base["topReplayResult"],
  }
end

ranked = history.fetch("top30").map { |row| build_candidate.call(row) }
zero = history.fetch("allScreened").find { |row| row.fetch("xHandle", "").downcase == "zeroknowledge0x" }
history_review = zero && zero["screeningRank"] > 30 ? [build_candidate.call(zero, "History review")] : []

thea = existing.find { |candidate| candidate.fetch("tier") == "Locked" }.dup
thea["selectionRank"] = 0
thea["businessLock"] = true
thea["analyzedHandCount"] = 0
thea["historicalPeakScore"] = nil
thea["historicalMaxRunHands"] = 0
thea["platformBestRank"] = nil
thea["versionCount"] = 0
thea["eligible20kRuns"] = 0
thea["positiveRunRate"] = nil
thea["rankRegression"] = nil
thea["scoreRegression"] = nil
thea["observedRuns"] = []
thea["scoreComponents"] = {}

payload = {
  "asOfPublic" => history.fetch("asOfPublic"),
  "asOfIdentity" => Time.now.utc.iso8601,
  "method" => history.fetch("method"),
  "rankedCount" => ranked.length,
  "specialReviewCount" => history_review.length + 1,
  "candidates" => [thea] + ranked + history_review,
}
File.write(output, JSON.pretty_generate(payload) + "\n")
