const asyncHandler = require("express-async-handler")
const { checkempty } = require("../utils/checkempty")
const validator = require('validator')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const UserModel = require("../models/User.model")
const { upload } = require("../utils/upload")

const cloudinary = require("cloudinary").v2

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUD_NAME
})

// exports.registerUser = asyncHandler(async (req, res) => {
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
//         await UserModel.create({ name, email, mobile, password: hashpass, role, profilePicture: req.file.filename })

//         res.json({ message: "register user success" })

//     })
// })
exports.registerUser = asyncHandler(async (req, res) => {
    upload(req, res, async err => {
        if (err) {
            return res.status(400).json({ message: "Unable to upload image", error: err.message })
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
                profilePicture: result.secure_url, // Store Cloudinary URL for the profile picture
            })

            res.json({ message: "User registered successfully", user: { name, email, mobile, role, profilePicture: result.secure_url } })
        })
    })
})
exports.loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(req.body)

        const { isError, error } = checkempty({ email, password })
        if (isError) {
            return res.status(400).json({ message: "All fields are required", error })
        }

        const isfound = await UserModel.findOne({ email })
        if (!isfound) {
            return res.status(400).json({ message: "Email or mobile not found" })
        }

        const isVerify = await bcrypt.compare(password, isfound.password)
        if (!isVerify) {
            return res.status(400).json({ message: "Password does not match" })
        }

        const token = jwt.sign({ userId: isfound._id }, process.env.JWT_KEY, { expiresIn: "15d" })

        if (isfound.role === "admin") {
            res.cookie("admin", token, {
                maxAge: 1000 * 60 * 60 * 24 * 15,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
        } else if (isfound.role === "photographer") {
            res.cookie("photographer", token, {
                maxAge: 1000 * 60 * 60 * 24 * 15,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
        } else if (isfound.role === "user") {
            res.cookie("user", token, {
                maxAge: 1000 * 60 * 60 * 24 * 15,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
        }

        res.json({
            message: "Credentials verified successfully",
            result: {
                _id: isfound._id,
                name: isfound.name,
                email: isfound.email,
                mobile: isfound.mobile,
                profilePicture: isfound.profilePicture,
                role: isfound.role,
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})
exports.logoutUser = asyncHandler(async (req, res) => {
    try {
        const { role } = req.body

        if (!role) {
            return res.status(400).json({ message: "Role is required for logout" })
        }
        console.log(role);

        if (role === "admin") {
            res.clearCookie("admin", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
        } else if (role === "photographer") {
            res.clearCookie("photographer", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
        } else if (role === "user") {
            res.clearCookie("user", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
        } else {
            return res.status(400).json({ message: "Invalid role specified" })
        }

        res.json({ message: `${role} logout successful` })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})


