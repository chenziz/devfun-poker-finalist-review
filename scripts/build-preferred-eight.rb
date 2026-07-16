require "json"

root = File.expand_path("..", __dir__)
research = "/Users/dichenhuang/arena-research/poker-finalist-selection-20260715"
candidates = JSON.parse(File.read(File.join(root, "app/data/candidates.json"))).fetch("candidates")
curated = JSON.parse(File.read(File.join(root, "app/data/clips.json")))
analysis = JSON.parse(File.read(File.join(research, "data/analysis.json"))).fetch("candidates")

specs = [
  ["TheAAI / AlphaHorizon", "Core 8", "KEEP — tournament anchor", "Tournament best #1 and already a business lock. Keep, but confirm the builder/X linkage and Heads-Up integration before announcement."],
  ["Thaddius", "Core 8", "KEEP — cross-format anchor", "History-aware #6, Tournament best #3, seven seasons, established public identity and already a business lock."],
  ["Junglist Soldier", "Core 8", "KEEP — elite HU record", "History-aware #2 with a deep HU sample and seven Tournament seasons. The public account is established."],
  ["Stariy physe", "Core 8", "KEEP — balanced performance", "History-aware #4 with strong current HU results, six Tournament seasons and a credible public footprint."],
  ["dein Joni", "Core 8", "KEEP — HU specialist", "History-aware #5 and current HU #3. Keep for competitive quality; Tournament evidence is much thinner than the rest of the group."],
  ["Antge Poker Bot", "Core 8", "KEEP — history correction case", "History-aware #3 despite a provisional current submission. Historical top-three HU form and Tournament best #4 make it a clear inclusion."],
  ["Grinder", "Core 8", "KEEP — performance favorite", "History-aware #1, current HU #1 and the strongest historical peak. Account linkage still deserves a manual check."],
  ["folzterac", "Core 8", "KEEP — strong final slot", "History-aware #7 with seven Tournament seasons and high clip density. A defensible eighth entrant once TheAAI is included separately."],
  ["izie", "Bench", "BENCH A — closest ranking challenger", "History-aware #8 and only narrowly outside this preferred group. Strong HU sample and clean operating signals, but no Tournament history."],
  ["KumaZero", "Bench", "BENCH B — best all-round challenger", "Current HU #6, Tournament best #3 across seven seasons and strong clip density. Lower composite rank, but arguably the best replacement if cross-format proof matters most."],
]

manual_highlights = {
  "cmrlui5wdudryst8nevy8570y" => "Pocket deuces flop a set and play a full-stack showdown against Neo Alpha.",
  "cmrlu8kfkrhudst8nzbvcdi5l" => "J2 makes a full house on a double-paired board and wins the full stack.",
  "cmrlswt94cn5wst8n3v8hn71o" => "KJ makes trip kings and converts the hand into a full-stack win.",
  "cmrln06qmnk76st8nl30ud6sj" => "Two pair reaches a full-stack showdown against dein Joni; useful for reviewing folzterac's commitment threshold.",
  "cmrlmhpjjiey5st8n1aets5f1" => "Top pair plays into a paired, three-club board and loses a full stack—an important downside review.",
  "cmrllztf1dpitst8n90287z4m" => "A4 fills up on the river and wins the full stack against dein Joni.",
  "cmrlrqtob0opvst8nyco8rx0g" => "KQ holds top pair on a paired board through a full-stack showdown.",
  "cmrlqu1larmo6st8n5ijl8dw9" => "A small pocket pair carries a heart into a four-heart board and wins a full stack.",
  "cmrlqd6qimsc8st8ntloxfj0h" => "Pocket tens face a paired-king board and lose the full stack—a useful risk-control review.",
  "cmrlv00vm03rwst8nk88uysy5" => "Pocket fives make a full house but lose the stack in a major cooler.",
  "cmrlmn4m0jv1ost8nw08501g4" => "Ace-jack wins a full-stack showdown on a coordinated runout against John Juanda.",
  "cmrlmgspyi5lbst8nbi1ag2ph" => "Q4 improves to two pair and wins the full stack against John Juanda.",
}

raw_clip_names = ["Stariy physe", "folzterac", "izie", "KumaZero"]
raw_ids = {
  "Stariy physe" => %w[cmrlui5wdudryst8nevy8570y cmrlu8kfkrhudst8nzbvcdi5l cmrlswt94cn5wst8n3v8hn71o],
  "folzterac" => %w[cmrln06qmnk76st8nl30ud6sj cmrlmhpjjiey5st8n1aets5f1 cmrllztf1dpitst8n90287z4m],
  "izie" => %w[cmrlrqtob0opvst8nyco8rx0g cmrlqu1larmo6st8n5ijl8dw9 cmrlqd6qimsc8st8ntloxfj0h],
  "KumaZero" => %w[cmrlv00vm03rwst8nk88uysy5 cmrlmn4m0jv1ost8nw08501g4 cmrlmgspyi5lbst8nbi1ag2ph],
}

players = specs.map.with_index do |(name, group, verdict, rationale), index|
  candidate = candidates.find { |row| row.fetch("name") == name }
  raise "Missing candidate: #{name}" unless candidate

  clips = if raw_clip_names.include?(name)
    source = analysis.find { |row| row.fetch("name") == name }.fetch("clips")
    raw_ids.fetch(name).map do |id|
      hand = source.find { |row| row.fetch("tableId") == id }
      {
        "replayId" => id,
        "replayUrl" => "https://arena.dev.fun/headsup-ladder/table/#{id}",
        "label" => hand.fetch("chipDelta") > 0 ? "Win" : "Loss review",
        "cards" => hand.fetch("holeCards"),
        "board" => hand.fetch("board"),
        "opponent" => hand.fetch("opponent"),
        "result" => format("%+d", hand.fetch("chipDelta")),
        "highlight" => manual_highlights.fetch(id),
      }
    end
  else
    source_name = name == "Thaddius" ? "Field / Thaddius" : name
    curated.select { |clip| clip.fetch("player") == source_name }.first(3).map do |clip|
      {
        "replayId" => clip.fetch("replay_id"),
        "replayUrl" => clip.fetch("replay_url"),
        "label" => clip.fetch("clip_type"),
        "cards" => clip.fetch("hero_cards"),
        "board" => clip.fetch("board"),
        "opponent" => clip.fetch("opponent"),
        "result" => clip.fetch("result"),
        "highlight" => clip.fetch("clip_highlight"),
      }
    end
  end

  {
    "order" => index + 1,
    "group" => group,
    "verdict" => verdict,
    "rationale" => rationale,
    "candidate" => candidate,
    "clips" => clips,
  }
end

payload = {
  "title" => "Preferred 8 Review Room",
  "asOf" => "2026-07-16 17:45 CST",
  "summary" => "The preferred eight are coherent: seven are the top seven history-aware ranked agents, and TheAAI is the Tournament/business-lock entrant.",
  "players" => players,
}

File.write(File.join(root, "app/data/preferred-eight.json"), JSON.pretty_generate(payload) + "\n")
