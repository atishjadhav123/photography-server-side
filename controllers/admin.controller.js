// const asyncHandler = require("express-async-handler")
// const { upload } = require("../utils/upload")
// const UserModel = require("../models/User.model")
// const { checkempty } = require("../utils/checkempty")
// const validator = require("validator")
// const bcrypt = require("bcryptjs")


// const cloudinary = require("cloudinary").v2

// cloudinary.config({
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     cloud_name: process.env.CLOUD_NAME
// })

// exports.adminregistrphotografer = asyncHandler(async (req, res) => {
//     upload(req, res, async err => {
//         if (err) {
//             return res.status(400).json({ message: "unable to upload" })
//         }
//         // console.log("mmmmmmmmmmmm", req.file)
//         const { name, email, mobile, password, role } = req.body
//         // console.log("Form data:", req.body)
//         const { isError, error } = checkempty({ name, email, password, mobile })
//         if (isError) {
//             return res.status(400).json({ message: "all feild are required", error })
//         }
//         if (!validator.isEmail(email)) {
//             return res.status(400).json({ message: "Invalid Email" })
//         }
//         if (!validator.isStrongPassword(password)) {
//             return res.status(400).json({ message: "provide Strong password" })
//         }
//         if (mobile && !validator.isMobilePhone(mobile, "en-IN")) {
//             return res.status(400).json({ message: "invalid mobile number" })
//         }
//         const hashpass = await bcrypt.hash(password, 10)
//         await UserModel.create({ name, email, mobile, password: hashpass, role, profilePicture: req.file.filename, adminId: req.user })

//         res.json({ message: "register user success" })

//     })
// })


const asyncHandler = require("express-async-handler")
const { upload } = require("../utils/upload")
const UserModel = require("../models/User.model")
const { checkempty } = require("../utils/checkempty")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUD_NAME
})

exports.adminregistrphotografer = asyncHandler(async (req, res) => {
    upload(req, res, async err => {
        if (err) {
            return res.status(400).json({ message: "unable to upload image", error: err.message })
        }

        const { name, email, mobile, password, role } = req.body
        const { isError, error } = checkempty({ name, email, password, mobile })
        if (isError) {
            return res.status(400).json({ message: "All fields are required", error })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" })
        }
        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ message: "Password must be strong" })
        }
        if (mobile && !validator.isMobilePhone(mobile, "en-IN")) {
            return res.status(400).json({ message: "Invalid mobile number" })
        }

        // Hashing the password
        const hashpass = await bcrypt.hash(password, 10)

        // Upload image to Cloudinary
        cloudinary.uploader.upload(req.file.path, async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error uploading image to Cloudinary", error: err.message })
            }

            // Create user with the uploaded Cloudinary URL
            await UserModel.create({
                name,
                email,
                mobile,
                password: hashpass,
                role,
                profilePicture: result.secure_url, // Using Cloudinary URL for profile picture
                adminId: req.user
            })

            res.json({ message: "User registered successfully", user: { name, email, mobile, role, profilePicture: result.secure_url } })
        })
    })
})
