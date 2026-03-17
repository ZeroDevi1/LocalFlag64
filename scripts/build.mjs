import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import pkg from "../package.json" with { type: "json" };
import { createPluginContext, renderPlugin } from "./lib/render-plugin.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

async function build() {
  const context = createPluginContext(pkg);

  await fs.rm(distDir, { force: true, recursive: true });
  await fs.mkdir(distDir, { recursive: true });

  await esbuild.build({
    bundle: true,
    format: "iife",
    entryPoints: [path.join(rootDir, "src/loon/main.ts")],
    logLevel: "info",
    minify: true,
    outfile: path.join(distDir, context.scriptFilename),
    platform: "browser",
    target: "es2020"
  });

  const pluginContent = renderPlugin(context);
  await fs.writeFile(
    path.join(distDir, context.pluginFilename),
    pluginContent,
    "utf8"
  );

  console.log(`Built ${context.pluginFilename}`);
  console.log(`Built ${context.scriptFilename}`);
  console.log(`Release base: ${context.releaseBaseUrl}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
