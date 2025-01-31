const asyncHandler = require("express-async-handler")
const { upload, uploadServiceImages } = require("../utils/upload")
const PhotoModel = require("../models/Photo.model")
const path = require("path")
const fs = require("fs/promises")
const ServicesModel = require("../models/Services.model")
const { default: mongoose } = require("mongoose")

const cloudinary = require("cloudinary").v2

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUD_NAME
})

exports.addImage = asyncHandler(async (req, res) => {
    upload(req, res, async err => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "File upload failed", error: err.message })
        }
        try {
            if (req.files) {
                const allImages = []
                const heros = []

                for (const item of req.files) {
                    allImages.push(cloudinary.uploader.upload(item.path))
                }

                const data = await Promise.all(allImages)
                for (const item of data) {
                    heros.push(item.secure_url)
                }
                const photographerId = req.photographer

                await PhotoModel.create({ ...req.body, hero: heros, photographerId })
                res.json({ message: "Image added successfully" })
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "An error occurred", error: error.message })
        }
    })

})
exports.getImage = asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await PhotoModel.find({ _id: id })
    res.json({ message: "all Image are fetch succcess", result })
})
exports.getAllImage = asyncHandler(async (req, res) => {
    // const { id } = req.params
    const result = await PhotoModel.find()
    res.json({ message: "all Image are fetch succcess", result })
})
exports.updateImage = asyncHandler(async (req, res) => {
    upload(req, res, async (err) => {
        try {
            const allImages = []
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const { secure_url } = await cloudinary.uploader.upload(file.path)
                    allImages.push(secure_url)
                }
                for (const file of req.files) {
                    try {
                        await fs.unlink(file.path)
                    } catch (fsError) {
                        console.error(`Failed to delete local file ${file.path}:`, fsError)
                    }
                }
            }
            const oldImage = await PhotoModel.findById(req.params.imageid)
            if (!oldImage) {
                return res.status(404).json({ message: "Image not found" })
            }

            if (req.body.like) {
                oldImage.likes = (oldImage.likes || 0) + 1;
            }
            const removeList = Array.isArray(req.body.remove)
                ? req.body.remove
                : req.body.remove ? [req.body.remove] : []
            if (removeList.length > 0) {
                oldImage.hero = oldImage.hero.filter((item) => !removeList.includes(item))
                await Promise.all(
                    removeList.map(async (item) => {
                        const publicId = item.split("/").pop().split(".")[0]
                        try {
                            await cloudinary.uploader.destroy(publicId)
                        } catch (cloudError) {
                            console.error(`Failed to delete Cloudinary ID ${publicId}:`, cloudError)
                        }
                    })
                )
            }
            oldImage.hero = [...oldImage.hero, ...allImages]
            await oldImage.save()
            res.json({ message: "Image update success", data: oldImage })
        } catch (error) {
            console.error("Error updating image:", error)
            res.status(400).json({ message: "Something went wrong", error })
        }
    })
})
exports.deleteImage = asyncHandler(async (req, res) => {
    try {
        const result = await PhotoModel.findById(req.params.imageid)
        if (!result) {
            return res.status(404).json({ message: "Image not found" })
        }
        for (const item of result.hero) {
            const publicId = item.split("/").pop().split(".")[0]
            try {
                const cloudinaryResult = await cloudinary.uploader.destroy(publicId)
                // console.log(`Cloudinary image deleted: ${publicId}`, cloudinaryResult)
            } catch (cloudinaryError) {
                console.error(`Error deleting image from Cloudinary: ${cloudinaryError}`)
                return res.status(500).json({ message: "Error deleting image from Cloudinary", error: cloudinaryError })
            }
        }
        await PhotoModel.findByIdAndDelete(req.params.imageid)
        res.json({ message: "Image deleted successfully" })
    } catch (error) {
        console.error("Error deleting image:", error)
        res.status(500).json({ message: "Something went wrong", error })
    }
})
exports.addLike = asyncHandler(async (req, res) => {
    try {
        const imageid = req.params.id;

        // Find the photo by ID
        const photo = await PhotoModel.findById(imageid);

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // Increment the likes count    
        photo.likes += 1;
        await photo.save();

        res.status(200).json({
            message: 'Like added successfully',
            data: { id: photo._id, likes: photo.likes },
        });
    } catch (error) {
        console.error('Error adding like:', error);
        res.status(500).json({ message: 'Failed to add like', error });
    }

})

exports.createService = asyncHandler(async (req, res) => {
    uploadServiceImages(req, res, async err => {
        const { userId } = req.body
        if (err) {
            console.log(err)
            return res.status(400).json({ message: "unable to upload" })
        }
        if (req.files) {
            const allImages = []
            const image = []
            for (const item of req.files) {
                allImages.push(cloudinary.uploader.upload(item.path))
            }
            const data = await Promise.all(allImages)
            for (const item of data) {
                image.push(item.secure_url)
            }
            const result = await ServicesModel.create({ ...req.body, userId: req.user, image: image })
            res.json({ message: "servic e add success", result })
        } else {
            res.status(400).json({ message: "hero image is required" })
        }
    })
})
exports.updateService = asyncHandler(async (req, res) => {
    uploadServiceImages(req, res, async err => {
        try {
            const { rating } = req.body
            const validRating = isNaN(rating) ? 0 : Number(rating);
            const allImages = [];


            // Handle uploading new images if any
            if (req.files && req.files.length > 0) {
                for (const item of req.files) {
                    const { secure_url } = await cloudinary.uploader.upload(item.path);
                    allImages.push(secure_url);
                }
            }

            // Find the existing service (old images)
            const oldImage = await ServicesModel.findById(req.params.id);
            if (!oldImage) {
                return res.status(404).json({ message: "Service not found" });
            }

            // Remove old images from the "image" array if "remove" is provided
            if (req.body.remove) {
                const result = oldImage.image.filter(item => !req.body.remove.includes(item));
                oldImage.image = result;

                // Delete the images from Cloudinary
                if (typeof req.body.remove === "string") {
                    await cloudinary.uploader.destroy(path.basename(req.body.remove, path.extname(req.body.remove)));
                } else {
                    for (const item of req.body.remove) {
                        const publicId = path.basename(item, path.extname(item));
                        await cloudinary.uploader.destroy(publicId);
                    }
                }
            }

            // Update the service with new images added
            await ServicesModel.findByIdAndUpdate(req.params.id, {
                ...req.body,
                rating: validRating,
                image: [...oldImage.image, ...allImages]
            });

            res.json({ message: "Service updated successfully" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Something went wrong", error: error.message });
        }
    });
})
exports.deleteService = asyncHandler(async (req, res) => {
    const result = await ServicesModel.findById(req.params.id)
    for (const item of result.image) {
        await cloudinary.uploader.destroy(path.basename(item, path.extname(item)))
    }
    await ServicesModel.findByIdAndDelete(req.params.id)
    res.json({ message: "service delete success" })
})
exports.getAllService = asyncHandler(async (req, res) => {
    const result = await ServicesModel.find()
    res.json({ message: "all services fetch success", result })
})
exports.getAllservicephoto = asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await ServicesModel.findOne({ _id: id })
    res.json({ message: "all Image are fetch succcess", result })
})




