import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const [output, origin] = process.argv.slice(2);
if (!output || !origin) throw new Error("Usage: check-links.mjs <build-directory> <site-origin>");
const root = path.resolve(output);
const site = new URL(origin);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(target));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

const failures = [];
let checked = 0;
for (const file of await htmlFiles(root)) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  const page = new URL(relative.endsWith("index.html") ? relative.slice(0, -10) : relative, site);
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const value = match[1].replaceAll("&amp;", "&");
    const url = new URL(value, page);
    if (url.origin !== site.origin) continue;
    const target = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (target !== root && !target.startsWith(root + path.sep)) {
      failures.push(`${relative}: path escapes build output: ${value}`);
      continue;
    }
    let destination;
    for (const candidate of [target, path.join(target, "index.html"), target + ".html"]) {
      try {
        if ((await stat(candidate)).isFile()) { destination = candidate; break; }
      } catch (error) {
        if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
      }
    }
    checked += 1;
    if (!destination) failures.push(`${relative}: missing local target ${value}`);
    else if (url.hash && destination.endsWith(".html")) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      const content = await readFile(destination, "utf8");
      const ids = [...content.matchAll(/\b(?:id|name)=["']([^"']*)["']/g)].map((entry) => entry[1]);
      if (!ids.includes(fragment)) failures.push(`${relative}: missing fragment ${value}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Checked ${checked} local links and assets in ${root}; all targets and HTML fragments exist.`);
