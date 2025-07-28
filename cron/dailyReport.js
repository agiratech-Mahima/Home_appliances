const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "cron-log.txt");
fs.appendFileSync(logFile, `[${new Date().toISOString()}] 🔥 Script started\n`);

setTimeout(() => {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ✅ Timeout complete\n`);
  fs.writeFileSync(path.join(__dirname, "report.pdf"), "PDF DUMMY CONTENT");
}, 60 * 1000); // 1 minute
