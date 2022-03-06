const protect = (req, res, next) => {
  const { user } = req.session;
  //Nếu người dùng chưa login thì sẽ trả về 401
  if (!user) {
    return res.status(401).json({ status: "fail", message: "unauthorized" });
  }
  req.user = user;
  next();
};

module.exports = protect;
