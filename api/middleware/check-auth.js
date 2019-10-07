const jwt = require('jsonwebtoken')


module.exports = (req, res, next) => {
    try {
        const decode = jwt.verify(req.body.token, "jwtSECRETKET");
        req.userData = decode;


    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
    next();
}