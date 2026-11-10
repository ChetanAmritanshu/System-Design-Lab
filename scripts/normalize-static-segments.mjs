// Next 16.3.7's static segment filename conversion flattens '/' but leaves
// Windows '\\' separators intact. Add the flat aliases requested by the client.
// Already-correct (including Linux CI) exports are unchanged. Do not delete files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function normalizeStaticSegments(root) {
  let copied = 0;
  const aliases = (directory, prefix, parent) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const source = path.join(directory, entry.name);
      if (entry.isDirectory())
        aliases(source, `${prefix}.${entry.name}`, parent);
      else if (entry.name.endsWith(".txt")) {
        const target = path.join(parent, `${prefix}.${entry.name}`);
        if (fs.existsSync(target)) {
          if (!fs.readFileSync(target).equals(fs.readFileSync(source)))
            throw new Error(`Conflicting static segment: ${target}`);
        } else {
          fs.copyFileSync(source, target);
          copied++;
        }
      }
    }
  };
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = path.join(directory, entry.name);
      if (entry.name.startsWith("__next."))
        aliases(child, entry.name, directory);
      else visit(child);
    }
  };
  visit(root);
  return copied;
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  console.log(
    `Static segment normalization: ${normalizeStaticSegments(path.resolve("out"))} flat aliases added.`,
  );
}
