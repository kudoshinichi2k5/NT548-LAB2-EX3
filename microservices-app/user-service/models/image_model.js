const mongoose = require("mongoose");

const db = require("../config/database");

const {Schema} = mongoose;

const imageSchema = new Schema ({
    image_url: {
        type: String,
        required:true,
        unique: true
    }
});

const ImageModel = db.model('images', imageSchema);

module.exports = ImageModel;