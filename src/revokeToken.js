const tokenExpirationManager = require('./tokenExpirationManager');

module.exports = (req, res) => {
  tokenExpirationManager.revokeToken(req.params.token);
  res.send({ success: true, token: req.params.token });
};
