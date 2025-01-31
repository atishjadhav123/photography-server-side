const multer = require("multer")
const path = require("path")

const productStorage = multer.diskStorage({
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname)
        const fileName = `${Date.now()}${fileExtension}`
        cb(null, fileName)
    },
    destination: (req, file, cb) => {
        cb(null, "uploads")
    },
})

const serviceStorage = multer.diskStorage({
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname)
        const fileName = `${Date.now()}${fileExtension}`
        cb(null, fileName)
    },
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'))
    },
})

exports.upload = multer({ storage: productStorage }).single('profilePicture')
exports.uploadServiceImages = multer({ dest: 'uploads/' }).array('image', 5)
