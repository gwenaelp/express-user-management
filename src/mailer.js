const sgMail = require('@sendgrid/mail');

module.exports = {
  async send(mailConfig) {
    const apiKey = require('./options').get().mails.apiKey;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      await sgMail.send(mailConfig);
    } else {
      console.warn('sendgrid api key undefined, skipping the "mail send" step');
      console.warn('Showing mail config :', mailConfig);
    }
  }
}
