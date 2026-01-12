require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_KEY_SECRET
});

async function uploadImage(filePath) {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        fs.unlinkSync(filePath);
        return {
            secure_url: result.secure_url
        };
    }
    catch (error) {
        throw error;
    }
}

module.exports = {uploadImage};

