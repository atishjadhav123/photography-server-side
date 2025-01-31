const {
    addImage, updateImage, deleteImage,
    getImage, addLike, getAllImage,
    createService,
    deleteService,
    updateService,
    getAllService,
    getAllservicephoto } = require("../controllers/PhotoGrafher.controller");
const { PhotographerProtected, UserProtected } = require("../middlware/Protected");

const router = require("express").Router();

router
    .post("/add-image", PhotographerProtected, addImage)
    .put("/update-image/:imageid", updateImage)
    .delete("/delete-image/:imageid", deleteImage)
    .get("/image/:id", getImage)
    .get("/getallimage/", getAllImage)
    .post("/add-like/:id", UserProtected, addLike)

    .post("/create-service", UserProtected, createService)
    .put("/update-service/:id", UserProtected, updateService)
    .delete("/delete-service/:id", deleteService)
    .get("/getallservice", getAllService)
    .get("/getallservicedetail/:id", getAllservicephoto)

module.exports = router;
