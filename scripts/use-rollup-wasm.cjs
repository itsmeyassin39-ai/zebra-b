const { existsSync, rmSync, cpSync, readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const rollupDir = path.join(root, "node_modules", "rollup");
const wasmDir = path.join(root, "node_modules", "@rollup", "wasm-node");
const wasmMarker = path.join(rollupDir, "dist", "wasm-node");

if (!existsSync(rollupDir) || existsSync(wasmMarker)) {
  process.exit(0);
}

if (!existsSync(wasmDir)) {
  console.warn("[use-rollup-wasm] @rollup/wasm-node not installed; skipping swap.");
  process.exit(0);
}

for (const pkg of ["rollup-win32-arm64-msvc", "rollup-win32-ia32-msvc", "rollup-win32-x64-msvc", "rollup-win32-x64-gnu"]) {
  rmSync(path.join(root, "node_modules", "@rollup", pkg), { recursive: true, force: true });
}

rmSync(rollupDir, { recursive: true, force: true });
cpSync(wasmDir, rollupDir, { recursive: true });

const pkgPath = path.join(rollupDir, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.name = "rollup";
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log("[use-rollup-wasm] Swapped native rollup for @rollup/wasm-node (Application Control policy blocks the native .node binary).");