const jwt = require("jsonwebtoken")
exports.adminProtected = async (req, res, next) => {
    try {
        const { admin } = req.cookies
        if (!admin) {
            return res.status(401).json({ meassage: "no Cookie Found" })
        }
        jwt.verify(admin, process.env.JWT_KEY, (err, decode) => {
            if (err) {
                return res.status(401).json({
                    meassage: "kuch toh gdbad hai"
                })
            }
            req.user = decode.userId
            next()
        })
    } catch (error) {
        res.status(500).json({ meassage: error.meassage || "user Protected error" })
    }
}

exports.UserProtected = async (req, res, next) => {
    try {
        if (!req.cookies.user) {
            return res.status(401).json({ meassage: "no Cookie Found" })
        }
        jwt.verify(req.cookies.user, process.env.JWT_KEY, (err, decode) => {
            if (err) {
                return res.status(401).json({
                    meassage: "kuch toh gdbad hai "
                })
            }
            req.user = decode.userId

            next()
        })
    } catch (error) {
        res.status(500).json({ meassage: error.meassage || "user Protected error" })
    }
}
exports.PhotographerProtected = async (req, res, next) => {
    try {

        if (!req.cookies.photographer) {
            return res.status(401).json({ message: "No Cookie Found" })
        }

        jwt.verify(req.cookies.photographer, process.env.JWT_KEY, (err, decode) => {
            if (err) {
                console.error('JWT Error:', err)
                return res.status(401).json({
                    message: "Invalid or expired token",
                })
            }

            req.photographer = decode.userId
            next()
        })
    } catch (error) {
        res.status(500).json({ message: error.message || "User Protected error" })
    }
}



