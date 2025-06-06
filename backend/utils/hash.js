const bcrypt = require('bcryptjs');

exports.hashPassword = async (password) => await bcrypt.hash(password, 12);
exports.comparePassword = async (password, hashed) => await bcrypt.compare(password, hashed);
