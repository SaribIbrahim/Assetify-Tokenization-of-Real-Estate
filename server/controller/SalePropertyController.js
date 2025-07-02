const express = require("express");
const multer = require("multer");
const path = require("path");
const SaleProperty = require("../models/SaleProperty");
const Property = require("../models/Property");

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// API to add a property
router.post(
  "/add-saleproperty",
  upload.fields([{ name: "PropertyImage" }, { name: "PropertyDocument" }]),
  async (req, res) => {
    try {
      const {
        PropertyName,
        PropertyAmount,
        PropertyDes,
        ownername,
        isFavorite,
        metamask_Address,
        nftId,
      } = req.body;

      const PropertyImage = req.files?.PropertyImage
        ? req.files.PropertyImage[0].path
        : req.body.PropertyImage;
      const PropertyDocument = req.files?.PropertyDocument
        ? req.files.PropertyDocument[0].path
        : req.body.PropertyDocument;

      const property = new SaleProperty({
        PropertyName,
        PropertyAmount,
        PropertyDes,
        ownername,
        isFavorite: isFavorite === "true",
        PropertyImage,
        PropertyDocument,
        metamask_Address,
        isSale: true,
        nftId,
        inverter1: null,
        inverter1Amount: 0,
        inverter2: null,
        inverter2Amount: 0,
      });

      console.log("nftid", nftId);

      await property.save();

      res.status(201).json({
        success: true,
        message: "Property added successfully!",
        property: { ...property._doc, nftId },
      });
    } catch (error) {
      console.error("Error adding property: ", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

// API to buy a share and update inverters
// router.post("/buy_saleproperty", async (req, res) => {
//   try {
//     const { id, metamask_Address, ownerType, shareAmount,nftId } = req.body;

//     const property = await Property.findOne({ nftId: Number(nftId) });
//     console.log("here is property,", property)
//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found.",
//       });
//     }

//     if (ownerType === "owner1" && !property.inverter1) {
//       property.inverter1 = metamask_Address; // Store address or user ID
//       property.inverter1Amount = shareAmount;
//     } else if (ownerType === "owner2" && !property.inverter2) {
//       property.inverter2 = metamask_Address;
//       property.inverter2Amount = shareAmount;
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid owner type or share already bought.",
//       });
//     }

//     if (property.inverter1 && property.inverter2) {
//       property.isSale = false; // Mark as fully sold when both inverters are set
//     }

//     await property.save();

//     res.status(200).json({
//       success: true,
//       message: "Share purchased successfully!",
//       property,
//     });
//   } catch (error) {
//     console.error("Error updating property: ", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//     });
//   }
// });


router.post("/buy_saleproperty", async (req, res) => {
  try {
    const { id, metamask_Address, ownerType, shareAmount, nftId } = req.body;

    const property = await SaleProperty.findOne({ nftId: Number(nftId) });
    console.log("here is property,", property);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    if (ownerType === "owner1" && !property.inverter1) {
      property.inverter1 = metamask_Address; // Store address as a string
      property.inverter1Amount = shareAmount;
    } else if (ownerType === "owner2" && !property.inverter2) {
      property.inverter2 = metamask_Address; // Store address as a string
      property.inverter2Amount = shareAmount;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid owner type or share already bought.",
      });
    }

    if (property.inverter1 && property.inverter2) {
      property.isSale = false; 
    }

    await property.save();

    res.status(200).json({
      success: true,
      message: "Share purchased successfully!",
      property,
    });
  } catch (error) {
    console.error("Error updating property: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// API to get properties by owner
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const properties = await SaleProperty.find({ ownername: id }).populate("ownername");
    if (!properties.length) {
      return res.status(404).json({ success: false, message: "Properties not found." });
    }
    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("Error fetching properties: ", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;