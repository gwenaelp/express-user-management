const sgMail = require('@sendgrid/mail');

module.exports = {
  async send(mailConfig) {
    const apiKey = require('./options').get().mails.apiKey;
    console.log('apiKey', apiKey, 'cfg', mailConfig);
    sgMail.setApiKey(apiKey);
    await sgMail.send(mailConfig);
  }
}
