const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const os = require("os");
const path = require("path");
const moment = require("moment");
const { sequelize, Product } = require("../models");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log("🕐 Waiting 5 minutes before sending report...");
  await delay(5 * 60 * 1000); // 5 minutes in ms

  try {
    console.log("🚀 Starting daily report task...");

    // 1. Fetch Data
    console.time("DB Queries");
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
    console.timeEnd("DB Queries");

    // 2. System Usage Info
    const ramUsed = os.totalmem() - os.freemem();
    const ramUsedMB = (ramUsed / (1024 * 1024)).toFixed(2);
    const dbSizeMB = (dbSize / (1024 * 1024)).toFixed(2);

    // 3. Generate PDF Report
    console.log("📝 Generating PDF...");
    console.time("PDF Generation");

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
    console.timeEnd("PDF Generation");

    // 4. Email Setup
    console.log("📤 Sending email...");
    console.time("Email Send");
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mahimakumari416@gmail.com",
        pass: "aweunxcyacczatyg",
      },
    });

    await transporter.sendMail({
      from: '"System Report" <mahimakumari416@gmail.com>',
      to: "mahimamahi1601@gmail.com",
      subject: "📝 Daily System Report",
      text: "Attached is your daily system report.",
      attachments: [
        {
          filename: "report.pdf",
          path: filePath,
        },
      ],
    });
    console.timeEnd("Email Send");

    console.log("✅ Report sent successfully.");
  } catch (err) {
    console.error("❌ Failed to send report:", err);
  }
})();
