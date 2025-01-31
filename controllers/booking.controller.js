const asyncHandler = require("express-async-handler")
const UserModel = require("../models/User.model")
const ServicesModel = require("../models/Services.model")
const sendEmail = require("../utils/email")
const BookingModel = require("../models/Booking.model")

exports.createBooking = asyncHandler(async (req, res) => {
    const { serviceId, photographerId } = req.body
    const customerData = await UserModel.findById(req.user)
    if (!customerData) {
        return res.status(404).json({ message: "Customer not found." })
    }
    const photographer = await ServicesModel.findOne(photographerId)
    const customerMessage = `
    Dear Customer,
    Your booking has been confirmed successfully. Here are the details:
    Thank you for using our service!
    Regards,
    Booking Team
    `
    try {
        await sendEmail({
            email: customerData.email,
            subject: "Booking Confirmation",
            message: customerMessage
        })
        const booking = await BookingModel.create({
            serviceId,
            userId: req.user,
            photographerId: photographer,
        })
        res.status(200).json({ message: "Booking created successfully and emails sent", booking })
    } catch (error) {
        console.error("Error sending emails:", error)
        res.status(500).json({ message: "Booking created but failed to send emails", error: error.message })
    }
})

exports.getAllBooking = asyncHandler(async (req, res) => {
    try {
        const bookings = await BookingModel.find({ userId: req.user }).populate('serviceId photographerId', 'title price category image');

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "No bookings found for this user." });
        }

        res.json({ message: "Bookings fetched successfully", bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
})

exports.getAllBookingPhotoGrafher = asyncHandler(async (req, res) => {
    const booking = await BookingModel.find().populate('serviceId photographerId', 'title price category image');
    if (!booking || booking.length === 0) {
        return res.status(404).json({ message: "No bookings found for this user." });
    }
    res.json({ message: "all booking are fetch success", booking })
})

exports.updateBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await BookingModel.findById(id);

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    try {
        const updatedBooking = await BookingModel.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({
            message: "Booking updated successfully",
            updatedBooking
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(400).json({ message: "Error updating booking" });
    }
});
exports.deleteBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await BookingModel.findById(id);

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure that only 'pending' bookings can be deleted
    if (booking.status !== 'pending') {
        return res.status(400).json({ message: "You can only delete pending bookings." });
    }

    await BookingModel.findByIdAndDelete(id);

    res.status(200).json({
        message: "Booking deleted successfully",
    });
});
exports.cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const booking = await BookingModel.findById(id);

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== 'pending') {
        return res.status(400).json({ message: "You can only cancel pending bookings." });
    }

    booking.status = 'cancelled'
    await booking.save();

    res.status(200).json({
        message: "Booking canceled successfully",
        booking,
    });
});
