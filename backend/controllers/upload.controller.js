exports.single = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "no file" });
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ success: true, url });
  } catch (e) {
    next(e);
  }
};
