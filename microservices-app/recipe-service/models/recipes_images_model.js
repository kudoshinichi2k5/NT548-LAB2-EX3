const mongoose = require("mongoose");

const db = require("../config/database");

const {Schema} = mongoose;

const recipes_imagesSchema = new Schema({
    recipe_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recipes",
        required: true
    },
    image_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "images",
        required: true
    }
});

const RecipeImageSchema = db.model('recipes_images', recipes_imagesSchema);

module.exports = RecipeImageSchema;