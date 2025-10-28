import jwt from 'jsonwebtoken';

const JWT_SECRET = 'tu_secreto_super_secreto_y_largo';

export const protect = (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
    
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = decoded;
            
            next(); 
        } catch (error) {
            return res.status(401).json({ message: 'Token no válido o expirado.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó token de autenticación.' });
    }
};