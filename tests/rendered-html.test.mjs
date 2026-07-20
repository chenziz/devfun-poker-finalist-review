import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finalist investigation site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Final Table Clip Investigator<\/title>/i);
  assert.match(html, /AlphaHorizon/);
  assert.match(html, /THEA/);
  assert.match(html, /thea_ai/);
  assert.match(html, /predictive intelligence model for reasoning and forecasting/);
  assert.doesNotMatch(html, /Adam Roy Hirschfeld|x\.com\/AlphaHorizon|TheAAI \/ AlphaHorizon/);
});

test("uses the Arena identity consistently across review datasets", async () => {
  const [candidatesRaw, preferredRaw, highlightsRaw, clipsRaw] = await Promise.all([
    readFile(new URL("../app/data/candidates.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/preferred-eight.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/finalist-highlights.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/clips.json", import.meta.url), "utf8"),
  ]);

  const candidates = JSON.parse(candidatesRaw);
  const preferred = JSON.parse(preferredRaw);
  const highlights = JSON.parse(highlightsRaw);
  const clips = JSON.parse(clipsRaw);
  const candidate = candidates.candidates.find((entry) => entry.name === "AlphaHorizon");
  const preferredCandidate = preferred.players.find((entry) => entry.candidate.name === "AlphaHorizon")?.candidate;
  const highlightPlayer = highlights.players.find((entry) => entry.name === "AlphaHorizon");

  for (const profile of [candidate, preferredCandidate, highlightPlayer?.profile]) {
    assert.ok(profile);
    assert.equal(profile.handle, "thea_ai");
    assert.equal(profile.displayName, "THEA");
    assert.equal(profile.identityRisk, "Low");
    assert.match(profile.bio, /^AlphaHorizon is a predictive intelligence model/);
  }

  assert.equal(clips.filter((clip) => clip.player === "AlphaHorizon").length, 10);
  assert.equal(clips.some((clip) => clip.player === "TheAAI / AlphaHorizon"), false);
});
