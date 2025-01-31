const asyncHandler = require("express-async-handler")
const { upload } = require("../utils/upload")
const UserModel = require("../models/User.model")
const { checkempty } = require("../utils/checkempty")
const validator = require("validator")
const bcrypt = require("bcryptjs")

exports.adminregistrphotografer = asyncHandler(async (req, res) => {
    upload(req, res, async err => {
        if (err) {
            return res.status(400).json({ message: "unable to upload" })
        }
        // console.log("mmmmmmmmmmmm", req.file)
        const { name, email, mobile, password, role } = req.body
        // console.log("Form data:", req.body)
        const { isError, error } = checkempty({ name, email, password, mobile })
        if (isError) {
            return res.status(400).json({ message: "all feild are required", error })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid Email" })
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ message: "provide Strong password" })
        }
        if (mobile && !validator.isMobilePhone(mobile, "en-IN")) {
            return res.status(400).json({ message: "invalid mobile number" })
        }
        const hashpass = await bcrypt.hash(password, 10)
        await UserModel.create({ name, email, mobile, password: hashpass, role, profilePicture: req.file.filename, adminId: req.user })

        res.json({ message: "register user success" })

    })
})