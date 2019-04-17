var express = require('express');
var app = express();

const userManagement = require('../../src/index');

const port = 3000;

userManagement.init(app, {
  mongoUrl: "mongodb://uuuu:pppp@xxxx.mlab.com:11111/users-test",
  /** nodeMailerConfig: {
    service: 'SendGrid',
    auth: {
      user: 'gwenaelp',
      pass: 'pppp'
    },
  }, */
});

app.get('/info', function (req, res) {
  res.send(req.user);
});

app.get('/apiKey', userManagement.auth.apiKey, function (req, res) {
  console.log('apiKeyDocument', req.apiKeyDocument);
  res.send({ success: true, project: req.apiKeyDocument });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
