const mongoose = require("mongoose")
const express = require("express")
require("dotenv").config()
const path = require("path")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const app = express()


app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.use(express.json())
app.use(cookieParser())
app.use(express.static("dist"))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

app.use("/api/auth", require("./routes/auth.route"))
app.use("/api/photo", require("./routes/photografher.route"))
app.use("/api/admin", require("./routes/admin.route"))
app.use("/api/transaction", require("./routes/transaction.route"))
app.use("/api/contact", require("./routes/contact.route"))
app.use("/api/booking", require("./routes/booking.route"))

app.use("*", (req, res) => {
    res.status(404).json({ message: `route not found ${req.method}:${req.url}` })
})
app.get('/', (req, res) => {
    res.send({
        activeStatus: true,
        error: false
    })
})

app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"))
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ message: "Server Error", error: err.message })
});

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.once("open", () => {
    console.log("mongo connected");
    app.listen(process.env.PORT, console.log("server running"))
});
