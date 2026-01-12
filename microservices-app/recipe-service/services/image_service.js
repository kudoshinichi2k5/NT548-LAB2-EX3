const ImageModel = require("../models/image_model");

class ImageService {

    static async createImage(imageData) {
        try {
            const {image_url} = imageData;
            const newImage = new ImageModel({
                image_url
            });

            return await newImage.save();
        }
        catch (error) {
            throw error;
        }
    }

    static async getImageId(image_url) {
        const image = await ImageModel.findOne({image_url});

        if (image) return image._id;
        return null;
    }

    static async getImageUrl(imageId) {
        const image = await ImageModel.findOne({_id: imageId});

        if (image) return image.image_url;
        return null; 
    }
}

module.exports = ImageService;