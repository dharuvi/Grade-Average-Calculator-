// Automated build/setup step: checks the source and assembles the deployable site in ./dist
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const files = ["index.html", "tests.html", "style.css", "grades.js", "app.js"];

// 1. Required files exist
for (const f of files) {
  if (!fs.existsSync(path.join(root, f))) { console.error("BUILD FAILED: missing " + f); process.exit(1); }
}
// 2. JavaScript has no syntax errors
for (const f of files.filter((f) => f.endsWith(".js"))) {
  execFileSync(process.execPath, ["--check", path.join(root, f)], { stdio: "inherit" });
}
// 3. index.html references every asset it needs
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const ref of ["style.css", "grades.js", "app.js"]) {
  if (!html.includes(ref)) { console.error("BUILD FAILED: index.html does not reference " + ref); process.exit(1); }
}
// 4. Assemble dist/
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(dist, f));
console.log("Build OK: " + files.length + " files written to dist/");
