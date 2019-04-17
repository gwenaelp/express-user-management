const nodemailer = require('nodemailer');
const optionsManager = require('./options');

module.exports = {
  send(mailConfig, done) {
    const options = optionsManager.get();
    console.log(options);
    const smtpTransport = nodemailer.createTransport(options.nodeMailerConfig);

    if(options.nodeMailerConfig) {
      smtpTransport.sendMail(mailConfig, done);
    } else {
      console.warn('no mailer config options defined, not sending mail.');
      console.warn(mailConfig);
      done();
    }
  }
}
