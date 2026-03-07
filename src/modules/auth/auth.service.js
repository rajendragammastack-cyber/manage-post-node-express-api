const User = require('./auth.model');

exports.register = async (data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw { statusCode: 400, message: 'Email already exists' };
  return User.create(data);
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 400, message: 'Invalid credentials' };

  const match = await user.comparePassword(password);
  if (!match) throw { statusCode: 400, message: 'Invalid credentials' };

  return user;
};