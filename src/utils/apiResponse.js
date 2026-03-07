exports.sendResponse = (res, { statusCode = 200, success = true, message = 'OK', data = null }) => {
  return res.status(statusCode).json({ success, message, data });
};
