const RecipeModel = require("../models/recipe_model");

class RecipeService {

    static async createRecipe(recipeInfo) {
        try {
            const {
                title,
                servings,
                ready_in_minutes,
                summary,
                instructions
            } = recipeInfo;

            const recipe = new RecipeModel({
                title,
                servings,
                ready_in_minutes : ready_in_minutes,
                summary,
                instructions
            });

            return await recipe.save();
        }
        catch (error) {
            throw error;
        }
    }

    static async getRecipeId(title) {
        try {
            const recipe = await RecipeModel.findOne({title});
            if (recipe) {
                return recipe._id;
            }
            else return null;
        }
        catch (error) {
            throw error;
        }
    }

    static async getRecipe(recipeId) {
        try {
            const recipe = await RecipeModel.findOne({_id: recipeId}).lean();
            if (recipe) return recipe;
            return null;
        }
        catch (error) {
            throw (error);
        }
    }

    static async incrementLikes(recipeId) {
        try {
            const updated = await RecipeModel.findByIdAndUpdate(
                recipeId,
                { $inc: { likes: 1 } },
                { new: true }
            );
            return updated;
        } catch (error) {
            throw new Error('Error incrementing likes: ' + error.message);
        }
    }

    static async decrementLikes(recipeId) {
        try {
            const recipe = await RecipeModel.findById(recipeId);
            if (!recipe) throw new Error('Recipe not found');

            if (recipe.likes > 0) {
                recipe.likes -= 1;
                await recipe.save();
            }

            return recipe;
        } catch (error) {
            throw new Error('Error decrementing likes: ' + error.message);
        }
    }
 
    static async getRecipeByName(title) {
        try {
            const recipes = await RecipeModel.find({ 
                title: { $regex: title, $options: 'i' } // Case-insensitive partial match
            });

            if (!recipes) return null;
            // Remove duplicate IDs using a Map to store unique _id values
            const uniqueRecipes = [...new Map(recipes.map(recipe => [recipe._id.toString(), recipe])).values()];

            return uniqueRecipes.map(recipe => ({
                _id: recipe._id,
                title: recipe.title,
            }));
        } catch (error) {
            console.log("Recipe Service Error", error);
        }
    }

    static async randomRecipe() {
        try {
            const count = await RecipeModel.countDocuments();
            const randomIndex = Math.floor(Math.random() * count);

            const randomRecipe = await RecipeModel.findOne().skip(randomIndex);

            return randomRecipe;

        }
        catch (error) {
            console.log("Random Recipe Error", error);
        }
    }

    static async getLikeRecipes () {
        try {
            const recipes = await RecipeModel.find()
                .sort({ likes: -1 }) // Sắp xếp giảm dần theo số lượt thích
                .select("_id title likes"); // Chỉ lấy các trường _id, title, likes

            return recipes;

        }
        catch (error) {
            console.log("Get Like Recipes Service Error", error);
        }
    }
}

module.exports = RecipeService;