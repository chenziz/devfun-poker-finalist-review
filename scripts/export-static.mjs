import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "static-export");
const routes = ["/", "/candidates", "/preferred-eight", "/finalist-highlights"];

await rm(output, { recursive: true, force: true });
await cp(resolve(root, "dist/client"), output, { recursive: true });

const workerUrl = pathToFileURL(resolve(root, "dist/server/index.js"));
workerUrl.searchParams.set("export", String(Date.now()));
const { default: worker } = await import(workerUrl.href);

for (const pathname of routes) {
  const response = await worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  if (!response.ok) {
    throw new Error(`Static export failed for ${pathname}: ${response.status}`);
  }

  const destination = pathname === "/"
    ? resolve(output, "index.html")
    : resolve(output, pathname.slice(1), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  const html = (await response.text()).replace(
    /\/(?:[^/\s"'()<>]+\/)*\.vinext\/fonts\//g,
    "/assets/_vinext_fonts/",
  );
  await writeFile(destination, html);
}

console.log(`Exported ${routes.length} routes to ${output}`);
