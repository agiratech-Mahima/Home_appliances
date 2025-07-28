// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const nodemailer = require("nodemailer");
// const os = require("os");
// const path = require("path");
// const moment = require("moment");
// try {
//   var { sequelize, Product } = require("../models");
// } catch (err) {
//   fs.appendFileSync(
//     path.join(__dirname, "cron-log.txt"),
//     `[${new Date().toISOString()}] ❌ Failed to import models: ${err.message}\n`
//   );
//   console.error("❌ Failed to import models:", err);
//   process.exit(1);
// }


// // ✅ Log to file immediately
// const logFilePath = path.join(__dirname, "cron-log.txt");
// const log = (msg) => {
//   const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
//   console.log(logMsg); // also show in terminal
//   fs.appendFileSync(logFilePath, logMsg);
// };

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// (async () => {
//   log("✅ Script started. Waiting 1 minute before sending report...");
//   await delay(1 * 60 * 1000); // 1 minute for testing

//   try {
//     log("🚀 Starting daily report task...");

//     // 1. Fetch data
//     const totalProducts = await Product.count();
//     const lowStockProducts = await Product.findAll({
//       where: {
//         stock: {
//           [sequelize.Sequelize.Op.lt]: 10,
//         },
//       },
//     });

//     const dbStats = await sequelize.query("SHOW TABLE STATUS", {
//       type: sequelize.QueryTypes.SELECT,
//     });
//     const dbSize = dbStats.reduce(
//       (sum, table) => sum + table.Data_length + table.Index_length,
//       0
//     );

//     // 2. System Info
//     const ramUsed = os.totalmem() - os.freemem();
//     const ramUsedMB = (ramUsed / (1024 * 1024)).toFixed(2);
//     const dbSizeMB = (dbSize / (1024 * 1024)).toFixed(2);

//     // 3. Generate PDF
//     const filePath = path.join(__dirname, "report.pdf");
//     const doc = new PDFDocument();
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     doc.fontSize(18).text("🧾 Daily System Report", { align: "center" }).moveDown();
//     doc.fontSize(12).text(`🗓 Date: ${moment().format("YYYY-MM-DD HH:mm:ss")}`).moveDown();
//     doc.text(`📦 Total Products: ${totalProducts}`);
//     doc.text(`⚠️ Low Stock Products (<10): ${lowStockProducts.length}`).moveDown();
//     doc.text(`💾 Database Size: ${dbSizeMB} MB`);
//     doc.text(`🖥 RAM Used: ${ramUsedMB} MB`);

//     doc.end();

//     await new Promise((resolve) => stream.on("finish", resolve));
//     log("📝 PDF generated successfully.");

//     // 4. Email Setup
//     let transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "mahimakumari416@gmail.com",
//         pass: "aweunxcyacczatyg", // App password
//       },
//       logger: true,
//       debug: true,
//     });

//     const emailResult = await transporter.sendMail({
//       from: '"System Report" <mahimakumari416@gmail.com>',
//       to: "mahimamahi1601@gmail.com",
//       subject: "📝 Daily System Report",
//       text: "Attached is your daily system report.",
//       attachments: [{ filename: "report.pdf", path: filePath }],
//     });

//     log("✅ Report sent successfully.");
//     log(`📧 Email Message ID: ${emailResult.messageId}`);
//   } catch (err) {
//     log(`❌ Failed to send report: ${err.message}`);
//     console.error(err);
//   }
// })();














const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const os = require("os");
const path = require("path");
const moment = require("moment");
const { sequelize, Product } = require("../models");

// Log to file
const log = (msg) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(path.join(__dirname, "cron-log.txt"), logMsg);
};

// Simple delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  log("🟡 Started script...");
  log("🕐 Waiting 1 minute before sending report...");
  await delay(1 * 60 * 1000); // 1 minute

  try {
    log("🚀 Starting daily report task...");

    // Step 1: Fetch Data
    const totalProducts = await Product.count();
    log(`📦 Total Products: ${totalProducts}`);

    const lowStockProducts = await Product.findAll({
      where: { stock: { [sequelize.Sequelize.Op.lt]: 10 } },
    });
    log(`⚠️ Low Stock Products: ${lowStockProducts.length}`);

    const dbStats = await sequelize.query("SHOW TABLE STATUS", {
      type: sequelize.QueryTypes.SELECT,
    });
    const dbSize = dbStats.reduce(
      (sum, table) => sum + table.Data_length + table.Index_length,
      0
    );
    const dbSizeMB = (dbSize / (1024 * 1024)).toFixed(2);
    log(`💾 Database size: ${dbSizeMB} MB`);

    // Step 2: System Info
    const ramUsed = os.totalmem() - os.freemem();
    const ramUsedMB = (ramUsed / (1024 * 1024)).toFixed(2);
    log(`🖥 RAM Used: ${ramUsedMB} MB`);

    // Step 3: Generate PDF
    const filePath = path.join(__dirname, "report.pdf");
    log(`📄 Creating PDF at: ${filePath}`);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(18).text("🧾 Daily System Report", { align: "center" }).moveDown();
    doc.fontSize(12).text(`🗓 Date: ${moment().format("YYYY-MM-DD HH:mm:ss")}`).moveDown();
    doc.text(`📦 Total Products: ${totalProducts}`);
    doc.text(`⚠️ Low Stock Products (<10): ${lowStockProducts.length}`).moveDown();
    doc.text(`💾 Database Size: ${dbSizeMB} MB`);
    doc.text(`🖥 RAM Used: ${ramUsedMB} MB`);
    doc.end();

    await new Promise((res, rej) => {
      writeStream.on("finish", res);
      writeStream.on("error", rej);
    });

    log("✅ PDF generated successfully.");

    // Step 4: Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mahimakumari416@gmail.com",
        pass: "aweunxcyacczatyg",
      },
      logger: true,
      debug: true,
    });

    const result = await transporter.sendMail({
      from: '"System Report" <mahimakumari416@gmail.com>',
      to: "mahimamahi1601@gmail.com",
      subject: "📝 Daily System Report",
      text: "Attached is your daily system report.",
      attachments: [{ filename: "report.pdf", path: filePath }],
    });

    log("📤 Email sent successfully.");
    log(`📧 Message ID: ${result.messageId}`);
  } catch (err) {
    log(`❌ ERROR: ${err.message}`);
    console.error(err);
  }
})();
