const tokenExpirationManager = require('./tokenExpirationManager');
module.exports = (req, res) => {
  res.send({
    success: true, tokens: tokenExpirationManager.listTokens()
  });
};
