const mongoose = require("mongoose");

const db = require("../config/database");

const { Schema } = mongoose;

const recipeSchema = new Schema ({
    title: {
        type: String,
        required: true,
        unique: true
    },
    servings: {
        type: Number,
        required: true
    },
    ready_in_minutes: {
        type: Number,
        required: true
    },
    summary: {
        type: String,
    },
    instructions: {
        type: String,
    },
    likes: {
        type: Number,
        default: 0
    }
});

const RecipeModel = db.model('recipes', recipeSchema);
module.exports = RecipeModel;