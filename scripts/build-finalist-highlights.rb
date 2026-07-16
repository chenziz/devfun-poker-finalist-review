require "json"
require "csv"

root = File.expand_path("..", __dir__)
research = "/Users/dichenhuang/arena-research/poker-finalist-selection-20260715"
selection = JSON.parse(File.read(File.join(research, "data/finalist_highlight_selection.json")))
preferred = JSON.parse(File.read(File.join(root, "app/data/preferred-eight.json"))).fetch("players")

profile_by_name = preferred.to_h do |entry|
  name = entry.fetch("candidate").fetch("name")
  [name, entry.fetch("candidate")]
end

accent = {
  "AlphaHorizon" => "#8cc8ff",
  "Thaddius" => "#d9ff59",
  "Junglist Soldier" => "#bc9cff",
  "Stariy physe" => "#68d8c4",
  "dein Joni" => "#ff8e9b",
  "Antge Poker Bot" => "#ff916e",
  "Grinder" => "#ffce73",
  "folzterac" => "#a8d56f",
}

players = selection.fetch("players").map.with_index do |player, index|
  lookup = player.fetch("name") == "AlphaHorizon" ? "TheAAI / AlphaHorizon" : player.fetch("name")
  candidate = profile_by_name.fetch(lookup)
  {
    "order" => index + 1,
    "name" => lookup == "Thaddius" ? "Thaddius / Field" : lookup,
    "sourceName" => player.fetch("name"),
    "accent" => accent.fetch(player.fetch("name")),
    "profile" => candidate,
    "source" => player.fetch("source"),
    "tablesScanned" => player.fetch("tablesScanned"),
    "replaysDeepReviewed" => player.fetch("replaysDeepReviewed"),
    "style" => player.fetch("style"),
    "stats" => player.fetch("stats"),
    "highlights" => player.fetch("highlights"),
  }
end

payload = {
  "generatedAt" => selection.fetch("generatedAt"),
  "method" => selection.fetch("method"),
  "summary" => {
    "players" => players.length,
    "tablesScanned" => players.sum { |player| player.fetch("tablesScanned") },
    "replaysDeepReviewed" => players.sum { |player| player.fetch("replaysDeepReviewed") },
    "highlights" => players.sum { |player| player.fetch("highlights").length },
  },
  "players" => players,
}

File.write(File.join(root, "app/data/finalist-highlights.json"), JSON.pretty_generate(payload) + "\n")

CSV.open(File.join(root, "public/finalist-highlight-manifest.csv"), "w") do |csv|
  csv << %w[player source clip_rank recommended_use category replay_url hero_cards board opponent result style_score drama_score commentary_score highlight why_style commentary_hook action_line]
  players.each do |player|
    player.fetch("highlights").each do |clip|
      csv << [
        player.fetch("name"), player.fetch("source"), clip.fetch("rank"), clip.fetch("recommendedUse"),
        clip.fetch("category"), clip.fetch("replayUrl"), clip.fetch("heroCards").join(" "),
        clip.fetch("board").join(" "), clip.fetch("opponent"), clip.fetch("chipDelta"),
        clip.fetch("styleScore"), clip.fetch("dramaScore"), clip.fetch("commentaryScore"),
        clip.fetch("highlight"), clip.fetch("whyStyle"), clip.fetch("commentaryHook"), clip.fetch("actionLine"),
      ]
    end
  end
end
