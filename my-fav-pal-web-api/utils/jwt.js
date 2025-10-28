import jwt from "jsonwebtoken";

const secret = "EmergentesTeam"; 

export function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: "1h" });
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Falta token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token inválido" });
    req.user = decoded;
    next();
  });
}