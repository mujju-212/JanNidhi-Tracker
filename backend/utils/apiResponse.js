exports.success = (res, message, data = null, status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

exports.error = (res, message, status = 500, data = null) => {
  return res.status(status).json({ success: false, message, data });
};
