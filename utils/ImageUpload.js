const cloudinary = require('cloudinary')
const {config} = require('../config/config.js')

cloudinary.v2.config({ 
    cloud_name: config.CLOUD_NAME, 
    api_key: config.CLOUDINARY_API_KEY, 
    api_secret: config.CLOUDINARY_API_SECRET
});

exports.upload = async (data) => {
    try {
        return cloudinary.v2.uploader.upload(
            data, {
                folder: 'products',
            }
        ).then(image => image.secure_url).catch((error) => {
            return {errors: ["Faild to upload image"], body: error, image: data}
        });
    } catch (error) {
        return {errors: ["Faild to upload image"], body: error, image: data}
    }
}