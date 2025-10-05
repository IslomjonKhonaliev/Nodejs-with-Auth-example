const Image = require("../models/images");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadImageController = async (req, res) => {
  try {
    // Check if file is missing in request object
    if (!req.file) {
      return res.status(401).json({
        success: false,
        message: "File is required! Please upload an image",
      });
    }

    // Upload an image to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    // Store the image url and public id along with uploaded user id in database
    const newUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });
    await newUploadedImage.save();

    // delete the file from local storage
    //fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Image is uploaded successfully",
      image: newUploadedImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

// Fetching or getting all the images
const fetchImagesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages/limit);

    const sortObject = {};
    sortObject[sortBy] = sortOrder;

    const images = await Image.find().sort(sortObject).skip(skip).limit(limit);
    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        data: images,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

// Delete the image
const deleteImageController = async (req, res) => {
  try {
    // First we need to take image id which is gonna be deleted
    const imageIdToBeDeleted = req.params.id;
    // Second we need user id who is able to delete image
    const userIdToDeleteImage = req.userInfo.userId;

    // Then find that image with id of deleting image
    const image = await Image.findById(imageIdToBeDeleted);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image is not found",
      });
    }

    // Check if this image is uploaded by the current user who is gonna delete this image
    if (image.uploadedBy.toString() !== userIdToDeleteImage) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this image! you can only delete the image which you have uploaded",
      });
    }

    // Delete this image from our cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Then delete this image from mongodb database
    await Image.findByIdAndDelete(imageIdToBeDeleted);

    res.status(200).json({
      success: true,
      message: "Image is deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};
module.exports = {
  uploadImageController,
  fetchImagesController,
  deleteImageController,
};
