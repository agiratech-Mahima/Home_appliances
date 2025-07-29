const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const os = require("os");
const path = require("path");
const moment = require("moment");
const { sequelize, Product } = require("../models");

const generateAndSendReport = async () => {
  try {
    console.log(" Starting daily report task...");

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

    const ramUsed = os.totalmem() - os.freemem();
    const ramUsedMB = (ramUsed / (1024 * 1024)).toFixed(2);
    const dbSizeMB = (dbSize / (1024 * 1024)).toFixed(2);

    console.log(" Generating PDF...");
    console.time("PDF Generation");

    const filePath = path.join(__dirname, "report.pdf");
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text("Daily System Report", { align: "center" }).moveDown();
    doc.fontSize(12).text(`Date: ${moment().format("YYYY-MM-DD HH:mm:ss")}`).moveDown();
    doc.text(`Total Products: ${totalProducts}`);
    doc.text(`Low Stock Products (<10): ${lowStockProducts.length}`).moveDown();

    if (lowStockProducts.length > 0) {
      doc.fontSize(12).text("Low Stock Product List:", { underline: true }).moveDown(0.5);

      lowStockProducts.forEach((product, index) => {
        doc.text(`- ${product.name} (${product.stock} left)`);
      });

      doc.moveDown();
    } else {
      doc.text("✅ All products are sufficiently stocked.").moveDown();
    }

    doc.text(`Database Size: ${dbSizeMB} MB`);
    doc.text(`RAM Used: ${ramUsedMB} MB`);

    doc.end();
    console.timeEnd("PDF Generation");

    console.log(" Sending email...");
    console.time("Email Send");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mahimakumari416@gmail.com",
        pass: "aweunxcyacczatyg",
      },
    });

    await transporter.sendMail({
      from: '"System Report" <mahimakumari416@gmail.com>',
      to: "mahimamahi1601@gmail.com",
      subject: "Daily System Report",
      text: "Attached is your daily system report in PDF format.",
      attachments: [
        {
          filename: "report.pdf",
          path: filePath,
        },
      ],
    });

    console.timeEnd("Email Send");
    console.log(" Report sent successfully.");
  } catch (err) {
    console.error("Failed to send report:", err);
  }
};

if (require.main === module) {
  generateAndSendReport();
}

module.exports = generateAndSendReport;
