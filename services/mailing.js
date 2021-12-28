const nodemailer = require('nodemailer');
const mailer = (name, recipientMail, code) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'procurementkiambulaw@gmail.com',
        pass: 'SCALMIS@022',
      },
    });
    const mailOptions = {
      from: 'procurementkiambulaw@gmail.com',
      to: recipientMail,
      subject: 'Account Credentials',
      html: `<p>Hi <b>${name} </b> your Account password is <b>${code}</b></p></br>`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject({ uyu: err });
      } else {
        resolve(info);
      }
    });
  });
};

module.exports = mailer;
