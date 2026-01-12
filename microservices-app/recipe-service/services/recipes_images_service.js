const RecipesImagesModel = require("../models/recipes_images_model");

class RecipesImagesService {
    static async createRecipeImage(data) {
        try {
            const {recipe_id, image_id} = data;
            const newItem = new RecipesImagesModel({
                recipe_id,
                image_id
            });

            return await newItem.save();
        }
        catch (error) {
            throw error;
        }
    }

    static async getImageId(recipeId) {
        try {
            const item = await RecipesImagesModel.findOne({recipe_id: recipeId}).lean();
            if (item) return item.image_id;
            return null;
        }
        catch (error) {
            throw error;
        }
    }
}

module.exports = RecipesImagesService;