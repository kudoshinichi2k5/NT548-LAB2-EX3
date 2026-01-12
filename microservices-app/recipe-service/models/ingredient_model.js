const mongoose = require("mongoose");

const db = require("../config/database");

const {Schema} = mongoose;

const ingredientSchema = new Schema({
    name: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    category: String
});

const IngredientModel = db.model('ingredients', ingredientSchema);
module.exports = IngredientModel;