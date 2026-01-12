import axios from 'axios';

const url = "";

export const getRandomRecipe = async (accessToken) => {
  try {
    const res = await axios.get(`${url}/api/recipe/randomRecipe`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("Response data:", res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const searchByRecipe = async (title, accessToken) => {
  try {
    const res = await axios.get(`${url}/api/recipe/searchByRecipe`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { title },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const searchByIngredient = async (ingredient, accessToken) => {
  try {
    const res = await axios.get(`${url}/api/recipe/searchByIngredient`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { name: ingredient },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const getRecipebyId = async (id, accessToken) => {
  try {
    const res = await axios.get(`${url}/api/recipe/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("Response data:", res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const getLikeRecipes = async (accessToken) => {
  try {
    const res = await axios.get(`${url}/api/recipe/likeRecipes`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};