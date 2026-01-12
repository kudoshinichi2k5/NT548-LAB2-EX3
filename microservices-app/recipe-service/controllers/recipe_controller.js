const mongoose = require("mongoose");

const RecipeService = require("../services/recipe_service");
const ImageService = require("../services/image_service");
const IngredientService = require("../services/ingredient_service");
const RecipesIngredientsService = require("../services/recipes_ingredients_service");
const RecipesImagesService = require("../services/recipes_images_service");

const {uploadImage} = require("../utilities/cloudinary");

exports.addRecipe = async (req, res, next) => {
    try {
        // 1. Lay thong tin
        const { recipeInfo } = req.body;
        const parsedRecipeInfo = JSON.parse(recipeInfo);

        const { 
            title, 
            servings, 
            ready_in_minutes, 
            summary, 
            instructions, 
            ingredients
        } = parsedRecipeInfo;

        const imageFile = req.file;
        // 2. Them image vao database
        if (!imageFile) {
            return res.status(400).json({ message: 'Image is required' });
        }   
        
        const uploadResult = await uploadImage(imageFile.path);

        const imageInfo = {
            image_url: uploadResult.secure_url.toString()
        }
        await ImageService.createImage(imageInfo);

        const imageId = await ImageService.getImageId(uploadResult.secure_url.toString());

        console.log({title, servings, ready_in_minutes, summary, instructions});
        await RecipeService.createRecipe({title, servings, ready_in_minutes, summary, instructions});
        const recipeId = await RecipeService.getRecipeId(title);

        
        // 4. Them ingredient vao database
        if (ingredients && Array.isArray(ingredients)) {
            for (const ingredient of ingredients) {
                const {name, amount, unit} = ingredient;

                const existed = await IngredientService.isIngredientExisted(name);
                if (!existed) {
                    await IngredientService.createIngredient(name);
                }

                const ingredientId = await IngredientService.getIngredientId(name);

                await RecipesIngredientsService.createRecipesIngredient({
                    recipe_id: recipeId,
                    ingredient_id: ingredientId,
                    amount,
                    unit
                });
            }
        }


        // 5. Them recipes_images
        await RecipesImagesService.createRecipeImage({recipe_id: recipeId, image_id: imageId});

        res.status(201).json({message: "Add recipe successful"});
    }
    catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRecipe = async (req, res, next) => {
    try {

        const {id} = req.params;

        const recipeId = new mongoose.Types.ObjectId(id);

        // 1. Lấy recipe chính
        const recipe = await RecipeService.getRecipe(recipeId);
        if (!recipe) 
            return res.status(404).json({message: "Recipe not found"});

        // 2. Lấy image_id từ recipes_images
        const imageId = await RecipesImagesService.getImageId(recipeId);
        
        // 3. Lấy image url từ images thông qua id
        const imageUrl = await ImageService.getImageUrl(imageId);

        // 4. Lấy danh sách ingredient thông qua recipeId
        const ingredients = await RecipesIngredientsService.getRecipeIngredients(recipeId);

        // 5. Gộp dữ liệu
        const finalResult = {
            _id: recipe._id,
            title: recipe.title,
            image: imageUrl,
            servings: recipe.servings,
            ready_in_minutes: recipe.ready_in_minutes,
            summary: recipe.summary,
            instructions: recipe.instructions,
            ingredients: ingredients,
            likes: recipe.likes
        };
        res.status(200).json(finalResult);
    }
    catch (error) {
        console.error("Error get recipe: ", error);
        res.status(500).json({message: "Internal server error!"});
    }
}


// Tim kiem mon an theo thanh phan
exports.searchByIngredient = async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: 'Ingredient name is required' });
        }

        const nameList = name.split(',').map(n => n.trim().toLowerCase());

        // Tập hợp tất cả các nhóm recipeId tương ứng với từng nguyên liệu
        const allRecipeIdGroups = [];

        for (const n of nameList) {
            const ingredients = await IngredientService.getIngredientsByName(n);

            if (!ingredients || ingredients.length === 0) {
                return res.status(404).json({ message: `Ingredient not found: ${n}` });
            }

            const recipeIdsForName = [];

            for (const ingredient of ingredients) {
                const ids = await RecipesIngredientsService.getRecipeIdsByIngredientId(ingredient._id);
                recipeIdsForName.push(...ids.map(id => id.toString())); // dùng string để so sánh
            }

            allRecipeIdGroups.push(new Set(recipeIdsForName));
        }

        // Tìm giao nhau giữa tất cả tập recipeId
        const intersectedRecipeIds = [...allRecipeIdGroups.reduce((a, b) => {
            return new Set([...a].filter(x => b.has(x)));
        })];

        if (intersectedRecipeIds.length === 0) {
            return res.status(200).json([]); // Không có công thức nào thỏa điều kiện
        }

        const recipeIds = intersectedRecipeIds.map(id => new mongoose.Types.ObjectId(id));

        // Lấy thông tin công thức và ảnh
        const result = await Promise.all(recipeIds.map(async (recipeId) => {
            const recipe = await RecipeService.getRecipe(recipeId);
            if (recipe) {
                const imageId = await RecipesImagesService.getImageId(recipeId);
                const imageUrl = await ImageService.getImageUrl(imageId);
                return {
                    _id: recipe._id,
                    title: recipe.title,
                    image: imageUrl
                };
            }
        }));

        res.status(200).json(result.filter(Boolean)); // loại null

    } catch (error) {
        console.error('Error search by ingredient:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Tim kiem mon an theo
exports.searchByRecipe = async(req, res, next) => {
    try {
        const {title} = req.query;

        if (!title) {
            res.status(400).json({message: "Recipe name is require"});
        }

        const recipes = await RecipeService.getRecipeByName(title);

        if (!recipes) {
            res.status(404).json({message: "Recipe not found"});
        }

        const result = await Promise.all(recipes.map(async (recipe) => {
            if (recipe) {
                const imageId = await RecipesImagesService.getImageId(recipe._id);
                const imageUrl = await ImageService.getImageUrl(imageId);
                return {
                    _id: recipe._id,
                    title: recipe.title,
                    image: imageUrl
                };
            }
        }));

        res.status(200).json(result);
    }
    catch (error) {
        console.log("Search By Recipe Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

// Random mon an
exports.randomRecipe = async (req, res, next) => {
    try {
        const recipe = await RecipeService.randomRecipe();

        const imageId = await RecipesImagesService.getImageId(recipe._id);
        const imageUrl = await ImageService.getImageUrl(imageId);

        const result = {
            _id: recipe._id,
            title: recipe.title,
            summary: recipe.summary,
            image: imageUrl
        }

        res.status(200).json(result);
    }
    catch (error) {
        console.log("Random Recipe Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

// Mon an co nhieu nguoi yeu thich
exports.getLikeRecipes = async(req, res, next) => {
    try {
        const recipes = await RecipeService.getLikeRecipes();
        const result = await Promise.all(recipes.map(async (recipe) => {
            if (recipe) {
                const imageId = await RecipesImagesService.getImageId(recipe._id);
                const imageUrl = await ImageService.getImageUrl(imageId);
                return {
                    _id: recipe._id,
                    title: recipe.title,
                    image: imageUrl,
                    likes: recipe.likes
                };
            }
        }));

        res.status(200).json(result);
    }
    catch (error) {
        console.log("Like Recipes Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}