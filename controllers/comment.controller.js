const asyncHandler = require("express-async-handler")
const CommentModel = require("../models/Comment.model")


exports.getCommentsByPhoto = asyncHandler(async (req, res) => {
    const { photoId } = req.params
    try {
        const comments = await CommentModel.find({ photoId }).sort({ timestamp: -1 })
        res.status(200).json(comments)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error })
    }
})

exports.createComment = asyncHandler(async (req, res) => {
    const { photoId, userId, text } = req.body
    try {
        const newComment = new CommentModel({ photoId, userId, text })
        await newComment.save()
        res.status(201).json(newComment)
    } catch (error) {
        res.status(500).json({ message: 'Error creating comment', error })
    }
})

exports.deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        await CommentModel.findByIdAndDelete(id)
        res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error })
    }
})

