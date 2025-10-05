const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Errer while uploading to cloudinary", error);
    throw new Error("Errer while uploading to cloudinary");
  }
};

module.exports = { uploadToCloudinary };
