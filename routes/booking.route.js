const { createBooking, getAllBooking, updateBooking, deleteBooking, getAllBookingPhotoGrafher } = require("../controllers/booking.controller")
const { UserProtected, PhotographerProtected } = require("../middlware/Protected")

const router = require("express").Router()

router


    .post("/create-booking", UserProtected, createBooking)
    .get("/getallbooking", UserProtected, getAllBooking)
    .get("/getallbookingphotografher", PhotographerProtected, getAllBookingPhotoGrafher)
    .put("/update-booking/:id", updateBooking)
    .delete("/delete-booking/:id", deleteBooking)

module.exports = router