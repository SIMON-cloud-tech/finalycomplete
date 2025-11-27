const fs = require("fs");
const path = require("path");

function buildTree(dir, prefix = "") {
  const files = fs.readdirSync(dir);
  let tree = "";

  files.forEach((file, index) => {
    const fullPath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const pointer = isLast ? "└── " : "├── ";

    tree += prefix + pointer + file + "\n";

    if (fs.statSync(fullPath).isDirectory() && file !== "node_modules") {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      tree += buildTree(fullPath, newPrefix);
    }
  });

  return tree;
}

// Build tree starting from project root
const projectRoot = process.cwd();
const treeOutput = buildTree(projectRoot);

// Write to PROJECT_STRUCTURE.md
const outputFile = path.join(projectRoot, "PROJECT_STRUCTURE.md");
fs.writeFileSync(
  outputFile,
  "# 📂 Project Structure\n\n```\n" + treeOutput + "```\n",
  "utf8"
);

console.log("✅ Project structure updated in PROJECT_STRUCTURE.md");
