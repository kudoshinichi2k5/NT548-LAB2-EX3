const mongoose = require("mongoose");

const db = require("../config/database");

const {Schema} = mongoose;

const recipes_ingredientsSchema = new Schema({
    recipe_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "recipes",
        required: true
    },
    ingredient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ingredients",
        required: true
    },
    amount: Number,
    unit: String
});

const RecipesIngredientsSchema = db.model('recipes_ingredients', recipes_ingredientsSchema);

module.exports = RecipesIngredientsSchema;