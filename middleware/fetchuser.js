const jwt = require('jsonwebtoken');  // "json web token" is a way of varification to a regular user
// const JWTSECRET = "sourabhisagoodboy";


const fetchuser = (req, res, next) => {
    // get the user from the jwt token and add id to req object
    const token = req.header('auth-token')

    if (!token) {
        res.status(401).send({ error: "please authenticate using a valid token" })
    }
    try {
        // for decode user id
        const data = jwt.verify(token, process.env.JWTSECRET);
        req.user = data.user;

        next()
    } catch (error) {
        res.status(401).send({ error: "please authenticate using a valid token" })
    }
}

module.exports = fetchuser
