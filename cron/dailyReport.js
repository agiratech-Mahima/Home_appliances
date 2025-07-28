const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const os = require("os");
const path = require("path");
const moment = require("moment");
const { sequelize, Product } = require("../models");

// Optional: Write logs to a file
const log = (msg) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(path.join(__dirname, "cron-log.txt"), logMsg);
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  log("🕐 Waiting 5 minutes before sending report...");
  await delay(5 * 60 * 1000);

  try {
    log("🚀 Starting daily report task...");

    // 1. Fetch data
    const totalProducts = await Product.count();
    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [sequelize.Sequelize.Op.lt]: 10,
        },
      },
    });

    const dbStats = await sequelize.query("SHOW TABLE STATUS", {
      type: sequelize.QueryTypes.SELECT,
    });
    const dbSize = dbStats.reduce(
      (sum, table) => sum + table.Data_length + table.Index_length,
      0
    );

    // 2. System Info
    const ramUsed = os.totalmem() - os.freemem();
    const ramUsedMB = (ramUsed / (1024 * 1024)).toFixed(2);
    const dbSizeMB = (dbSize / (1024 * 1024)).toFixed(2);

    // 3. Generate PDF
    const filePath = path.join(__dirname, "report.pdf");
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text("🧾 Daily System Report", { align: "center" }).moveDown();
    doc.fontSize(12).text(`🗓 Date: ${moment().format("YYYY-MM-DD HH:mm:ss")}`).moveDown();
    doc.text(`📦 Total Products: ${totalProducts}`);
    doc.text(`⚠️ Low Stock Products (<10): ${lowStockProducts.length}`).moveDown();
    doc.text(`💾 Database Size: ${dbSizeMB} MB`);
    doc.text(`🖥 RAM Used: ${ramUsedMB} MB`);

    doc.end();
    log("📝 PDF generated successfully.");

    // Wait for file to finish writing
    await new Promise((res) => setTimeout(res, 3000));

    // 4. Email Setup
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mahimakumari416@gmail.com",
        pass: "aweunxcyacczatyg", // App Password
      },
      logger: true,
      debug: true,
    });

    const emailResult = await transporter.sendMail({
      from: '"System Report" <mahimakumari416@gmail.com>',
      to: "mahimamahi1601@gmail.com",
      subject: "📝 Daily System Report",
      text: "Attached is your daily system report.",
      attachments: [{ filename: "report.pdf", path: filePath }],
    });

    log("✅ Report sent successfully.");
    log(`📧 Email Message ID: ${emailResult.messageId}`);
  } catch (err) {
    log(`❌ Failed to send report: ${err.message}`);
    console.error(err);
  }
})();
