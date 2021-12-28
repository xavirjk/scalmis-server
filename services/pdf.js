const { Auth } = require('../models');
const fs = require('fs');
const pdfDoc = require('pdfkit');
const getStream = require('get-stream');
function generateHeader(doc, stock) {
  let dsText = 'REQUISITION FORM';
  if (stock) dsText = 'STOCK SHEET';
  doc
    .image('Data/assets/BANNER.jpg', 50, 10, { width: 500, height: 40 })
    .fillColor('#444444')
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(`KIAMBU LAW COURT ${dsText} FINANCIAL YEAR ----/----`, 50, 60)
    .fontSize(10)
    .moveDown();
}
function generateFooterStock(doc) {
  doc.fontSize(10).text('End of Active Stock Listing.', 50, 780, {
    align: 'center',
    width: 500,
  });
}
function generateFooterInvoice(doc) {
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('Supply Chain Management', 70, 655)
    .fontSize(8)
    .text('Remarks', 55, 675)
    .text('Procurement Plan', 155, 675)
    .text('Method of Procurement', 255, 675)
    .text('Name:', 405, 675)
    .text('Yes  NO', 155, 695)
    .text('Signature:', 405, 695)
    .text('Date', 500, 695)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('ACCOUNTING OFFICER/AIE HOLDER(APPROVED/NOT APPROVED)', 70, 715)
    .fontSize(8)
    .text('Name:', 155, 735)
    .text('Signature', 155, 755)
    .text('Date:', 300, 755)
    .moveDown();
  generateHr(doc, 650);
  generateHr(doc, 670);
  generateHr(doc, 710);
  generateHr(doc, 730);
  generateHr(doc, 770);
  generateHr(doc, 690, 150);
  generateHr(doc, 750, 150);
  generateV(doc, 50, 650, 770);
  generateV(doc, 550, 650, 770);
  generateV(doc, 150, 670, 710);
  generateV(doc, 170, 690, 710);
  generateV(doc, 250, 670, 710);
  generateV(doc, 400, 670, 710);
  generateV(doc, 150, 730, 770);
}
function generateStockInformationService(doc, index) {
  let y = index + 10;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('No.', 50, y)
    .text('Service Code', 70, y)
    .text('Service', 150, y)
    .text('Quantity', 500, y)
    .moveDown();
  generateHr(doc, index);
  generateHr(doc, y + 10);
  return y;
}
function generateStockInformation(doc) {
  doc
    .text(`Inventory List as at Date Generated ${new Date()}`, 100, 120)
    .text('No.', 50, 140)
    .text('Item Code', 70, 140)
    .text('Item', 150, 140)
    .text('Description', 250, 140)
    .text('Unit Price', 440, 140)
    .text('In Stock', 500, 140)
    .moveDown();
  generateHr(doc, 130);
  generateHr(doc, 150);
}
function generateHr(doc, y, x) {
  if (x === undefined) x = 50;
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(x, y).lineTo(550, y).stroke();
}
function generateV(doc, x, y, end) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(x, y).lineTo(x, end).stroke();
}
function generateTableRow(doc, y, index, c1, c2, c3, c4, c5) {
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(index, 50, y)
    .text(c1, 70, y)
    .text(c2, 150, y)
    .text(c3, 250, y)
    .text(`ksh.${c4}`, 440, y, { width: 50, align: 'right' })
    .text(c5, 500, y, { width: 40, align: 'right' });
}
function generateStockTable(doc, data) {
  let position = 150;
  var tally = 0;
  var sum = 0;
  for (let i = 0; i < data.length; i++) {
    let unit = data[i].dsassetValue / data[i].quantifier;
    if (isNaN(unit)) unit = 0;
    if (!isFinite(unit)) unit = 0;
    tally += data[i].progressCount;
    sum += unit * data[i].progressCount;
    position = position + 20;
    let range = doc.bufferedPageRange();
    if (range.count === 1 && position > 740) {
      position = addPage(doc);
    } else if (position > 780) position = addPage(doc);
    generateTableRow(
      doc,
      position,
      i,
      data[i].code,
      data[i].item,
      data[i].description,
      unit,
      data[i].progressCount
    );
  }
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Total Value', 400, position + 35, { width: 100, align: 'center' })
    .text('Number', 500, position + 35)
    .text(`ksh.${sum}`, 400, position + 50, { width: 100, align: 'center' })
    .text(tally, 500, position + 50, { width: 40, align: 'right' });
  generateHr(doc, position + 30, 400);
  generateHr(doc, position + 45, 400);
  generateHr(doc, position + 73, 400);
  return position + 75;
}
function generateServiceTable(doc, data, y) {
  let i;
  for (i = 0; i < data.length; i++) {
    const range = doc.bufferedPageRange();
    y += 20;
    if (y > 720 && range.count === 1) {
      y = addPage(doc);
    } else if (y > 750) y = addPage(doc);
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(i, 50, y)
      .text(data[i].code, 70, y)
      .text(data[i].item, 150, y)
      .text(1, 500, y, { width: 40, align: 'right' });
  }
}
async function generateInvoiceTable(doc, data, y, index) {
  if (!data.refMember) {
    data['refMember'] = {};
    data.refMember['office'] = data.member.office;
  }

  if (data.refMember.pjno) {
    const member = await Auth.findByPjno(data.refMember.pjno);
    data.refMember['fullname'] = member.fullName;
  } else if (!data.refMember.fullname)
    data.refMember['fullname'] = data.member.fullName;
  doc
    .fontSize(6.5)
    .font('Helvetica')
    .text(index, 50, y)
    .text(truncateS(data.itemId.item, 17), 70, y)
    .text(truncateS(data.assetId.description, 25), 130, y)
    .text(data.quantity, 220, y, { width: 20, align: 'right' })
    .text(truncateS(data.refMember.fullname, 17), 250, y)
    .text(truncateS(data.refMember.office, 17), 330, y)
    .text(new Date(data.issuedAt).toLocaleDateString(), 390, y)
    .text(data._id, 420, y, { width: 130, align: 'right' })
    .moveDown();
}
async function generateInvoicePeriodTable(doc, data) {
  let position = 170;
  for (let i = 0; i < data.length; i++) {
    position = position + 15;
    position = setPageBreak(doc, position);
    await generateInvoiceTable(doc, data[i], position, i);
  }
  return position;
}
async function generateInvoiceTableSingle(doc, data, y) {
  doc
    .fontSize(10)
    .text(1, 50, y)
    .text(data.itemId.item, 70, y)
    .text(data.assetId ? data.assetId.description : '', 150, y)
    .text(data.quantity ? data.quantity : 1, 450, y, {
      width: 30,
      align: 'right',
    });
}
function generateInvoiceInformationSingleBar(doc, service) {
  doc
    .text('No.', 50, 200)
    .text(`${service ? 'Service' : 'Item'}`, 70, 200)
    .text(`${service ? '' : 'Description'}`, 150, 200)
    .text('Quantity', 450, 200)
    .moveDown();
}
async function generateInvoiceInformationSingle(doc, data, mult) {
  const date = new Date().toLocaleDateString();
  if (data.refMember) {
    let ref = data.refMember;
    if (ref.pjno) {
      const member = await Auth.findByPjno(ref.pjno);
      data.refMember['fullname'] = member.fullName;
    }
  } else {
    data['refMember'] = {};
    data.refMember['fullname'] = data.member.fullName;
    data.refMember['office'] = data.member.office;
  }
  doc
    .text(`UNIT / REGISTRY: ${data.refMember.office.toUpperCase()}`, 50, 120)
    .text(!mult ? '' : `Ref  ${data._id}`, 50, 140)
    .text(!mult ? date : 'Date Issued ' + data.issuedAt, 50, 160)
    .text(data.refMember.fullname, 300, 140)
    .text(data.refMember.office, 300, 160)
    .moveDown();
  generateHr(doc, 130);
  generateHr(doc, 170);
  generateHr(doc, 210);
}
function generateInvoiceInforOfficePeriodItems(doc) {
  doc
    .text('No.', 50, 200)
    .text('Item', 70, 200)
    .text('Description', 150, 200)
    .text('Quantity', 300, 200)
    .text('Date', 350, 200)
    .text('Ref', 400, 200, { width: 150, align: 'right' })
    .moveDown();
}
function generateInvoiceInforOfficePeriodService(doc, index) {
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('No.', 50, index)
    .text('Service', 70, index)
    .moveDown();
  generateHr(doc, index - 5);
  generateHr(doc, index + 10);
}
function generateInvoiceTablePeriodItems(doc, data) {
  let y = 200;
  for (let i = 0; i < data.length; i++) {
    y += 15;
    y = setPageBreak(doc, y);
    doc
      .font('Helvetica')
      .fontSize(7)
      .text(i, 50, y)
      .text(data[i].itemId.item, 70, y)
      .text(data[i].assetId.description, 150, y)
      .text(data[i].quantity, 300, y)
      .text(new Date(data[i].issuedAt).toLocaleDateString(), 350, y)
      .text(data[i].id, 400, y, { width: 150, align: 'right' })
      .moveDown();
  }
  return y;
}
async function generateInvoiceDataOfficePeriodService(doc, services, y, cmp) {
  for (let i = 0; i < services.length; i++) {
    if (cmp) {
      if (services[i].refMember) {
        let ref = services[i].refMember;
        if (ref.pjno) {
          const member = await Auth.findByPjno(ref.pjno);
          services[i].refMember['fullname'] = member.fullName;
        }
      } else {
        services[i]['refMember'] = {};
        services[i].refMember['fullname'] = services[i].member.fullName;
        services[i].refMember['office'] = services[i].member.office;
      }
    }
    y += 20;
    y = setPageBreak(doc, y);
    let date = new Date(services[i].issuedAt).toLocaleDateString();
    doc
      .font('Helvetica')
      .fontSize(6.5)
      .text(i, 50, y)
      .text(truncateS(services[i].itemId.item, 47), 70, y)
      .text(1, cmp ? 220 : 300, y, { width: 20, align: 'right' })
      .text(cmp ? truncateS(services[i].refMember.fullname, 17) : '', 250, y)
      .text(cmp ? truncateS(services[i].refMember.office, 17) : '', 330, y)
      .text(date, cmp ? 390 : 350, y)
      .text(services[i].id, 400, y, { width: 150, align: 'right' })
      .moveDown();
  }
}
exports.createStockListing = async (data, services, path) => {
  let doc = pre(true);
  generateStockInformation(doc);
  let index = generateStockTable(doc, data);
  index = generateStockInformationService(doc, index);
  generateServiceTable(doc, services, index);
  return await post(doc, path, false);
};

exports.generateInvoice = async (data, path) => {
  let service = true;
  if (data.assetId) service = false;
  let doc = pre(false);
  await generateInvoiceInformationSingle(doc, data, true);
  generateInvoiceInformationSingleBar(doc, service);
  await generateInvoiceTableSingle(doc, data, 220);
  return await post(doc, path, true);
};

exports.generateInvoicePeriod = async (data) => {
  let doc = pre(false);
  const { services, items } = sanitizeData(data);
  generateInvoiceInformation(doc);
  let index = await generateInvoicePeriodTable(doc, items);
  generateInvoiceInforOfficePeriodService(doc, index + 20);
  await generateInvoiceDataOfficePeriodService(doc, services, index + 30, true);
  return await post(doc, 'Data/assets/periodInv.pdf', true);
};
exports.generateOfficeInvoicePeriod = async (data) => {
  let doc = pre(false);
  const { services, items } = sanitizeData(data);
  await generateInvoiceInformationSingle(doc, data[0], false);
  await generateInvoiceInforOfficePeriodItems(doc);
  let index = generateInvoiceTablePeriodItems(doc, items);
  generateInvoiceInforOfficePeriodService(doc, index + 20);
  generateInvoiceDataOfficePeriodService(doc, services, index + 30);
  return await post(doc, 'Data/assets/officeInvPeriod.pdf', true);
};
const pre = (stock) => {
  let doc = new pdfDoc({ margins: 50, bufferPages: true });
  generateHeader(doc, stock);
  return doc;
};
const post = async (doc, path, invoice) => {
  if (!invoice) generateFooterStock(doc);
  else generateFooterInvoice(doc);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
  const pdfStream = await getStream.buffer(doc);
  return pdfStream;
};

const sanitizeData = (data) => {
  const services = [];
  const items = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].assetId) items.push(data[i]);
    else services.push(data[i]);
  }
  return { services, items };
};

function generateInvoiceInformation(doc) {
  doc
    .text('Date:' + new Date().toLocaleDateString(), 50, 130)
    .fontSize(8)
    .text('No.', 50, 150)
    .text('Item', 70, 150)
    .text('Description', 130, 150)
    .text('quant', 220, 150)
    .text('Identity', 250, 150)
    .text('Office', 330, 150)
    .text('Date', 390, 150)
    .text('Ref', 420, 150, { width: 130, align: 'right' })
    .moveDown();
  generateHr(doc, 120);
  generateHr(doc, 140);
  generateHr(doc, 160);
}

function addPage(doc) {
  doc.addPage();
  return 30;
}

function setPageBreak(doc, position) {
  let range = doc.bufferedPageRange();
  if (range.count == 1 && position > 720) position = addPage(doc);
  else if (position > 750) position = addPage(doc);
  return position;
}

function truncateS(statement, i) {
  let len = statement.length;
  if (len < i) return statement;
  return statement.substring(0, i) + '..';
}
