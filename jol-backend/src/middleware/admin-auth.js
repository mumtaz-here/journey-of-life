// middleware/adminAuth.js
export default function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
