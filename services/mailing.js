const nodeMailer = require('nodemailer');
const vars = require('../context/env');

const mailer = async (name, recipientMail, code) => {
  const oAuth2Client = new google.auth.OAuth2(
    vars.CLIENT_ID,
    vars.CLIENT_SECRET,
    vars.REDIRECT_URL
  );
  oAuth2Client.setCredentials({ refresh_token: vars.REFRESH_TOKEN });
  const accessToken = await oAuth2Client.getAccessToken();
  const transport = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAUTH2',
      user: vars.EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  const mailOptions = {
    from: `Kiambu Law Courts <${vars.EMAIL}>`,
    subject: 'Account Credentials',
    to: recipientMail,
    html: `<p>Hi <b>${name} </b> your Account password is <b>${code}</b></p></br>`,
  };
  const result = await transport.sendMail(mailOptions);
  return result;
};

module.exports = mailer;
