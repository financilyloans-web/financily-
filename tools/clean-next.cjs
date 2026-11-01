const fs = require("fs");
const path = require("path");
const dir = path.join(process.cwd(), ".next");
if (fs.existsSync(dir)) {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("cleaned .next");
} else {
  console.log(".next not present");
}
