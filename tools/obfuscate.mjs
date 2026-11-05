import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JavaScriptObfuscator from "javascript-obfuscator";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const configFile = path.join(root, "tools", "config.src.js");
const srcFile = path.join(root, "tools", "app.src.js");
const outFile = path.join(root, "app.packed.js");

// 配置和业务逻辑一起打包，配置里的字符串会进入混淆器的字符串数组
const config = fs.readFileSync(configFile, "utf8");
const app = fs.readFileSync(srcFile, "utf8");

const result = JavaScriptObfuscator.obfuscate(config + "\n" + app, {
  compact: true,
  simplify: true,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  stringArray: true,
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  selfDefending: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
});

fs.writeFileSync(outFile, result.getObfuscatedCode(), "utf8");
console.log("生成 app.packed.js：" + (fs.statSync(outFile).size / 1024).toFixed(1) + " KB");
