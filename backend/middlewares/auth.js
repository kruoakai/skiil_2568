const jwt = require('jsonwebtoken');

module.exports = (...roles) => {
  return (req,res,next)=>{
    try{
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if(!token) return res.status(401).json({success:false, message:'Missing token'});
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if(roles.length && !roles.includes(payload.role)){
        return res.status(403).json({success:false, message:'Forbidden'});
      }
      req.user = payload;
      next();/// allow to go to next middleware/route handler 
    }catch(e){
      e.status = e.name === 'JsonWebTokenError' ? 401 : 500;
      next(e);
    }
  }
}

// middlewares/auth.js
// const jwt = require('jsonwebtoken');

// module.exports = (...allowRoles) => (req, res, next) => {
//   try {
//     const h = req.get('Authorization') || '';
//     const bearer = h.startsWith('Bearer ') ? h.slice(7) : null;
//     const cookie = req.cookies?.token || null;
//     const q = req.query?.token || null;

//     // ให้ "header" มีลำดับความสำคัญสูงสุด
//     const token = bearer || cookie || q;

//     // log ที่มาไว้ดีบัก
//     console.log('auth source =', bearer ? 'header' : cookie ? 'cookie' : q ? 'query' : 'none');

//     if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = payload; // { id, email, role, ... }

//     if (allowRoles.length && !allowRoles.includes(payload.role)) {
//       return res.status(403).json({ success: false, message: 'Forbidden' });
//     }
//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };