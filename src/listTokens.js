const tokenExpirationManager = require('./tokenExpirationManager');
module.exports = async (req, res) => {
  const tokens = await tokenExpirationManager.listTokens();
  res.send({ success: true, tokens });
};
