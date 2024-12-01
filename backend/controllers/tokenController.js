const Token = require('../models/Token');

exports.getUserTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokens = await Token.findAll({ where: { userId } });
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tokens', error });
  }
};
