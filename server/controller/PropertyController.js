// Import required modules
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Property = require("../models/Property");
const SaleProperty = require("../models/SaleProperty");

// Create a new router
const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API to add a property
router.post(
  "/add-saleproperty",
  upload.fields([
    { name: "PropertyImage", maxCount: 1 },
    { name: "PropertyDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        PropertyName,
        PropertyAmount,
        PropertyDes,
        ownername,
        isFavorite,
        metamask_Address,
        nftId 
      } = req.body;

      // Handle file uploads
      const PropertyImage = req.files["PropertyImage"]
        ? `${req.protocol}://${req.get("host")}/uploads/${req.files["PropertyImage"][0].filename}`
        : null;
      const PropertyDocument = req.files["PropertyDocument"]
        ? `${req.protocol}://${req.get("host")}/uploads/${req.files["PropertyDocument"][0].filename}`
        : null;

      // Create a new property document
      const property = new Property({
        PropertyName,
        PropertyAmount,
        PropertyDes,
        ownername,
        isFavorite: isFavorite === "true", // Convert to boolean
        PropertyImage,
        PropertyDocument,
        metamask_Address,
        nftId,
      });

      // Save to the database
      await property.save();

      res.status(201).json({
        success: true,
        message: "Property added successfully!",
        property,
      });
    } catch (error) {
      console.error("Error adding property: ", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

// API to get all properties
router.get("/properties", async (req, res) => {
  try {
    const {search=""}=req.query
    console.log("search",search)
    const properties = await Property.find({
      PropertyName: { $regex: search, $options: "i" },
      $or: [
        // Either inverter1 is empty (null or undefined)
        { inverter1: { $exists: false } },
        { inverter1: null },
        // OR inverter2 is empty (null or undefined)
        { inverter2: { $exists: false } },
        { inverter2: null }
      ]
    })
      .populate('inverter1')
      .populate('inverter2')
      .populate('ownername')

      const saleProperties = await SaleProperty.find({isSale:true,PropertyName: { $regex: search, $options: "i" },}).populate('ownername')
      const combinedResults = [...properties, ...saleProperties];

    return res.status(200).json({ success: true, properties:combinedResults });
  } catch (error) {
    console.error("Error fetching properties: ", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// API to get a single property by ID
router.get("/property/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate('ownername');
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }
    res.status(200).json({ success: true, property });
  } catch (error) {
    console.error("Error fetching property: ", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


// Example: GET /property/inverter/:inverterId
// Returns all properties where inverter1 == inverterId OR inverter2 == inverterId

router.get('/property/byOwnerAddress/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate address
    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid address provided.',
      });
    }

    // Fetch properties where ownerOneAddress or ownerTwoAddress matches
    const properties = await Property.find({
      $or: [
        { ownerOneAddress: address },
        { ownerTwoAddress: address },
      ],
    }).populate('ownername inverter1 inverter2');

    // Fetch sale properties where ownerOneAddress or ownerTwoAddress matches
    const saleProperties = await SaleProperty.find({
      $or: [
        { ownerOneAddress: address },
        { ownerTwoAddress: address },
      ],
    }).populate('ownername inverter1 inverter2');

    // Combine results
    const combinedProperties = [...properties, ...saleProperties];

    return res.status(200).json({
      success: true,
      properties: combinedProperties,
    });
  } catch (error) {
    console.error('Error fetching properties by owner address:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.get("/inverter/:inverterId", async (req, res) => {
  try {
    const { inverterId } = req.params;

    // Find all properties where either inverter1 or inverter2 equals inverterId
    const properties = await Property.find({
      $or: [{ inverter1: inverterId }, { inverter2: inverterId }],
    })
      .populate("inverter1") // populate user info for inverter1
      .populate("inverter2")
      .populate('ownername')


    // If none found, you can return a 200 with success=false or a 404. Your call.
    if (!properties || properties.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No properties found for this inverter ID.",
      });
    }

    // We only want to modify the response if the property matches the `inverterId`.
    // For each property, check if `inverter1` or `inverter2` is the one that matches,
    // then override `ownername` and `PropertyAmount` in the **returned** data.

    // Map over each property to create a "transformed" object.
    const transformedProperties = properties.map((prop) => {
      // Convert Mongoose document to a plain JS object,
      // so we can safely modify fields without affecting the DB.
      const propObj = prop.toObject();

      // If `inverter1` is the matching ID, override fields in the output
      if (prop?.inverter1?._id?.toString() === inverterId) {
        // Suppose the user model has a field like `username` or `name`.
        // Adjust the field name if yours differs.

        propObj.ownername = prop.inverter1;
        propObj.PropertyAmount = prop.inverter1Amount;
        propObj.inverter1Sale = true;

      }
      // If `inverter2` is the matching ID, override fields in the output
      else if (prop?.inverter2?._id?.toString() === inverterId) {

        propObj.ownername = prop.inverter2;
        propObj.PropertyAmount = prop.inverter2Amount;
        propObj.inverter2Sale = true;
      }

      // Return the modified object
      return propObj;
    });

    return res.status(200).json({
      success: true,
      properties: transformedProperties,
    });
  } catch (error) {
    console.error("Error fetching properties by inverter ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});


// API to get by Wallet Address
router.get("/:metamask_Address", async (req, res) => {
    try {
      const { metamask_Address } = req.params;
      const property = await Property.find({ metamask_Address }).populate('ownername');
      if (!property) {
        return res.status(404).json({ success: false, message: "Property not found." });
      }
      res.status(200).json({ success: true, property });
    } catch (error) {
      console.error("Error fetching property: ", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  });

// API to update a property by ID
router.put(
  "/property/:id",
  upload.fields([
    { name: "PropertyImage", maxCount: 1 },
    { name: "PropertyDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        PropertyName,
        PropertyAmount,
        PropertyDes,
        ownername,
        isFavorite,
        PropertyImage,
        PropertyDocument,
        inverter2Sale,
        inverter1Sale
      } = req.body;

      const updates = {
        PropertyName,
        PropertyAmount,
        PropertyDes,
        ownername,
        PropertyImage,
        PropertyDocument,
        inverter2Sale,
        inverter1Sale,
        isFavorite: isFavorite === "true",
      };

      // Handle file updates
      if (req.files["PropertyImage"]) {
        updates.PropertyImage = req.files["PropertyImage"][0].path;
      }
      if (req.files["PropertyDocument"]) {
        updates.PropertyDocument = req.files["PropertyDocument"][0].path;
      }

      const property = await Property.findByIdAndUpdate(id, updates, { new: true });

      if (!property) {
        return res.status(404).json({ success: false, message: "Property not found." });
      }

      res.status(200).json({
        success: true,
        message: "Property updated successfully!",
        property,
      });
    } catch (error) {
      console.error("Error updating property: ", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

// API to delete a property by ID
router.delete("/property/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndDelete(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found." });
    }
    res.status(200).json({
      success: true,
      message: "Property deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting property: ", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

router.patch('/share/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const {
      inverter1,
      inverter1Amount,
      inverter2,
      inverter2Amount,
      PropertyAmount
    } = req.body;

    // Find the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Conditionally update inverter1 & inverter1Amount if provided
    if (typeof inverter1 !== 'undefined') {
      property.inverter1 = inverter1;
    }
    if (typeof inverter1Amount !== 'undefined') {
      property.inverter1Amount = inverter1Amount;
    }

    // Conditionally update inverter2 & inverter2Amount if provided
    if (typeof inverter2 !== 'undefined') {
      property.inverter2 = inverter2;
    }
    if (typeof inverter2Amount !== 'undefined') {
      property.inverter2Amount = inverter2Amount;
    }
    if (typeof PropertyAmount !== 'undefined') {
      property.PropertyAmount = PropertyAmount;
    }

    // Save to DB
    const updatedProperty = await property.save();

    // Return updated
    return res.status(200).json({
      success: true,
      message: 'Property shared successfully!',
      data: updatedProperty,
    });
  } catch (error) {
    console.error('Error in /share/:propertyId PATCH:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error: error.message,
    });
  }
});


router.put("/update-favorite/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { isFavorite } = req.body;

    // Validate input
    if (typeof isFavorite !== 'boolean') {
      return res.status(400).json({ message: "isFavorite must be a boolean" });
    }

    // Try to find and update in Property collection
    let property = await Property.findOneAndUpdate(
      { _id: propertyId },
      { $set: { isFavorite } },
      { new: true, runValidators: true }
    );

    if (property) {
      return res.status(200).json({ message: "Property updated successfully", property });
    }

    // Try to find and update in SaleProperty collection
    let saleProperty = await SaleProperty.findOneAndUpdate(
      { _id: propertyId },
      { $set: { isFavorite } },
      { new: true, runValidators: true }
    );

    if (saleProperty) {
      return res.status(200).json({ message: "Sale Property updated successfully", saleProperty });
    }

    return res.status(404).json({ message: "Property not found" });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// router.put("/update-favorite/:propertyId", async (req, res) => {
//   try {
//       const { propertyId } = req.params;
//       const { isFavorite } = req.body;

//       // Try to find in Property collection
//       let property = await Property.findOne({ _id: propertyId });

//       if (property) {
//           property.isFavorite = isFavorite;
//           await property.save();
//           return res.status(200).json({ message: "Property updated successfully", property });
//       }

//       // Try to find in SaleProperty collection
//       let saleProperty = await SaleProperty.findOne({ _id: propertyId });

//       if (saleProperty) {
//           saleProperty.isFavorite = isFavorite;
//           await saleProperty.save();
//           return res.status(200).json({ message: "Sale Property updated successfully", saleProperty });
//       }

//       return res.status(404).json({ message: "Property not found" });
//   } catch (error) {
//       console.error("Error updating property:", error);
//       return res.status(500).json({ message: "Internal server error" });
//   }
// });


// router.put("/property/:id/ownerOne", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { ownerOne } = req.body;

//     // Validate the input
//     if (typeof ownerOne !== "boolean") {
//       return res.status(400).json({
//         success: false,
//         message: "ownerOne must be a boolean value.",
//       });
//     }

//     // Try to find in Property collection
//     let property = await Property.findOne({ _id: id });

//     if (property) {
//       property.ownerOne = ownerOne;
//       // Increment inverter1Amount by 0.2
//       property.inverter1Amount = (property.inverter1Amount || 0) + 0.2;
//       await property.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerOne and inverter1Amount updated successfully",
//         property,
//       });
//     }

//     // Try to find in SaleProperty collection (if applicable)
//     let saleProperty = await SaleProperty.findOne({ _id: id });

//     if (saleProperty) {
//       saleProperty.ownerOne = ownerOne;
//       // Increment inverter1Amount by 0.2
//       saleProperty.inverter1Amount = (saleProperty.inverter1Amount || 0) + 0.2;
//       await saleProperty.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerOne and inverter1Amount updated successfully in SaleProperty",
//         saleProperty,
//       });
//     }

//     return res.status(404).json({
//       success: false,
//       message: "Property not found",
//     });
//   } catch (error) {
//     console.error("Error updating ownerOne:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });
// old api
// router.put("/property/:id/ownerOne", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { ownerOne } = req.body;

//     // Validate the input
//     if (typeof ownerOne !== "boolean") {
//       return res.status(400).json({
//         success: false,
//         message: "ownerOne must be a boolean value.",
//       });
//     }

//     // Try to find in Property collection
//     let property = await Property.findOne({ _id: id });

//     if (property) {
//       property.ownerOne = ownerOne;
//       await property.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerOne updated successfully",
//         property,
//       });
//     }

//     // Try to find in SaleProperty collection (if applicable)
//     let saleProperty = await SaleProperty.findOne({ _id: id });

//     if (saleProperty) {
//       saleProperty.ownerOne = ownerOne;
//       await saleProperty.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerOne updated successfully in SaleProperty",
//         saleProperty,
//       });
//     }

//     return res.status(404).json({
//       success: false,
//       message: "Property not found",
//     });
//   } catch (error) {
//     console.error("Error updating ownerOne:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });

// NEW ROUTE: API to update ownerTwo by property ID

// router.put("/property/:id/ownerTwo", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { ownerTwo } = req.body;

//     // Validate the input
//     if (typeof ownerTwo !== "boolean") {
//       return res.status(400).json({
//         success: false,
//         message: "ownerTwo must be a boolean value.",
//       });
//     }

//     // Try to find in Property collection
//     let property = await Property.findOne({ _id: id });

//     if (property) {
//       property.ownerTwo = ownerTwo;
//       // Increment inverter2Amount by 0.2
//       property.inverter2Amount = (property.inverter2Amount || 0) + 0.2;
//       await property.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerTwo and inverter2Amount updated successfully",
//         property,
//       });
//     }

//     // Try to find in SaleProperty collection (if applicable)
//     let saleProperty = await SaleProperty.findOne({ _id: id });

//     if (saleProperty) {
//       saleProperty.ownerTwo = ownerTwo;
//       // Increment inverter2Amount by 0.2
//       saleProperty.inverter2Amount = (saleProperty.inverter2Amount || 0) + 0.2;
//       await saleProperty.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerTwo and inverter2Amount updated successfully in SaleProperty",
//         saleProperty,
//       });
//     }

//     return res.status(404).json({
//       success: false,
//       message: "Property not found",
//     });
//   } catch (error) {
//     console.error("Error updating ownerTwo:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });

//old api
// router.put("/property/:id/ownerTwo", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { ownerTwo } = req.body;

//     // Validate the input
//     if (typeof ownerTwo !== "boolean") {
//       return res.status(400).json({
//         success: false,
//         message: "ownerTwo must be a boolean value.",
//       });
//     }

//     // Try to find in Property collection
//     let property = await Property.findOne({ _id: id });

//     if (property) {
//       property.ownerTwo = ownerTwo;
//       await property.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerTwo updated successfully",
//         property,
//       });
//     }

//     // Try to find in SaleProperty collection (if applicable)
//     let saleProperty = await SaleProperty.findOne({ _id: id });

//     if (saleProperty) {
//       saleProperty.ownerTwo = ownerTwo;
//       await saleProperty.save();
//       return res.status(200).json({
//         success: true,
//         message: "ownerTwo updated successfully in SaleProperty",
//         saleProperty,
//       });
//     }

//     return res.status(404).json({
//       success: false,
//       message: "Property not found",
//     });
//   } catch (error) {
//     console.error("Error updating ownerTwo:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// });


router.put("/property/:id/ownerOne", async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerOne, ownerOneAddress } = req.body;

    // Validate the input
    if (typeof ownerOne !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "ownerOne must be a boolean value.",
      });
    }
    if (ownerOneAddress && typeof ownerOneAddress !== "string") {
      return res.status(400).json({
        success: false,
        message: "ownerOneAddress must be a string.",
      });
    }

    // Try to find in Property collection
    let property = await Property.findOne({ _id: id });

    if (property) {
      property.ownerOne = ownerOne;
      property.inverter1Amount = (parseFloat(property.inverter1Amount) || 0) + 0.2;
      if (ownerOneAddress) {
        property.ownerOneAddress = ownerOneAddress;
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: "ownerOne, inverter1Amount, and ownerOneAddress updated successfully",
        property,
      });
    }

    // Try to find in SaleProperty collection (if applicable)
    let saleProperty = await SaleProperty.findOne({ _id: id });

    if (saleProperty) {
      saleProperty.ownerOne = ownerOne;
      saleProperty.inverter1Amount = (parseFloat(saleProperty.inverter1Amount) || 0) + 0.2;
      if (ownerOneAddress) {
        saleProperty.ownerOneAddress = ownerOneAddress;
      }
      await saleProperty.save();
      return res.status(200).json({
        success: true,
        message: "ownerOne, inverter1Amount, and ownerOneAddress updated successfully in SaleProperty",
        saleProperty,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Property not found",
    });
  } catch (error) {
    console.error("Error updating ownerOne:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


router.put("/property/:id/ownerTwo", async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerTwo, ownerTwoAddress } = req.body;

    // Validate the input
    if (typeof ownerTwo !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "ownerTwo must be a boolean value.",
      });
    }
    if (ownerTwoAddress && typeof ownerTwoAddress !== "string") {
      return res.status(400).json({
        success: false,
        message: "ownerTwoAddress must be a string.",
      });
    }

    // Try to find in Property collection
    let property = await Property.findOne({ _id: id });

    if (property) {
      property.ownerTwo = ownerTwo;
      property.inverter2Amount = (parseFloat(property.inverter2Amount) || 0) + 0.2;
      if (ownerTwoAddress) {
        property.ownerTwoAddress = ownerTwoAddress;
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: "ownerTwo, inverter2Amount, and ownerTwoAddress updated successfully",
        property,
      });
    }

    // Try to find in SaleProperty collection (if applicable)
    let saleProperty = await SaleProperty.findOne({ _id: id });

    if (saleProperty) {
      saleProperty.ownerTwo = ownerTwo;
      saleProperty.inverter2Amount = (parseFloat(saleProperty.inverter2Amount) || 0) + 0.2;
      if (ownerTwoAddress) {
        saleProperty.ownerTwoAddress = ownerTwoAddress;
      }
      await saleProperty.save();
      return res.status(200).json({
        success: true,
        message: "ownerTwo, inverter2Amount, and ownerTwoAddress updated successfully in SaleProperty",
        saleProperty,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Property not found",
    });
  } catch (error) {
    console.error("Error updating ownerTwo:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});



router.put('/property/:id/sellOwnerShare', async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerType, userAddress } = req.body; // Add userAddress to verify

    // Validate input
    if (!['ownerOne', 'ownerTwo'].includes(ownerType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ownerType. Must be "ownerOne" or "ownerTwo".',
      });
    }
    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'User address is required and must be a string.',
      });
    }

    // Find property
    let property = await Property.findOne({ _id: id });
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Update based on ownerType and verify userAddress
    if (ownerType === 'ownerOne') {
      if (property.ownerOneAddress !== userAddress) {
        return res.status(403).json({
          success: false,
          message: 'User is not ownerOne for this property',
        });
      }
      property.ownerOne = false;
      property.ownerOneAddress = '';
      property.inverter1Amount = '0'; // Ensure string type matches schema
    } else if (ownerType === 'ownerTwo') {
      if (property.ownerTwoAddress !== userAddress) {
        return res.status(403).json({
          success: false,
          message: 'User is not ownerTwo for this property',
        });
      }
      property.ownerTwo = false;
      property.ownerTwoAddress = '';
      property.inverter2Amount = '0'; // Ensure string type matches schema
    }

    await property.save();

    return res.status(200).json({
      success: true,
      message: 'Owner share sold successfully',
      property,
    });
  } catch (error) {
    console.error('Error selling owner share:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});


router.put("/property/update-price/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newPrice } = req.body;

    // Validate the input
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "newPrice must be a valid positive number.",
      });
    }

    // Find and update in Property collection
    let property = await Property.findOne({ _id: id });

    if (property) {
      property.UpdatePrice = Number(newPrice);
      await property.save();
      return res.status(200).json({
        success: true,
        message: "Price updated successfully",
        property,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Property not found",
    });
  } catch (error) {
    console.error("Error updating price:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


router.put("/property/update-report-reason/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reportReason } = req.body;

    // Validate the input
    if (!reportReason || typeof reportReason !== "string" || reportReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "reportReason must be a non-empty string.",
      });
    }

    // Update only the reportReason field without validating the entire document
    const property = await Property.findOneAndUpdate(
      { _id: id },
      { $set: { reportReason: reportReason.trim() } },
      { new: true } // Return the updated document
    );

    if (property) {
      return res.status(200).json({
        success: true,
        message: "Report reason updated successfully",
        property,
      });
    }

    return res.status(404).json({
      success: false,
      message: "Property not found",
    });
  } catch (error) {
    console.error("Error updating report reason:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/property/with-update-price", async (req, res) => {
  try {
    // Find properties where UpdatePrice is non-empty
    const properties = await Property.find({
      UpdatePrice: { $exists: true, $ne: "" },
    }).select("_id PropertyName UpdatePrice PropertyAmount PropertyDes createdAt");

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No properties found with an updated price",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Properties with updated price retrieved successfully",
      properties,
    });
  } catch (error) {
    console.error("Error retrieving properties with update price:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/property/with-report-reason", async (req, res) => {
  try {
    // Find properties where reportReason is non-empty
    const properties = await Property.find({
      reportReason: { $exists: true, $ne: "" },
    }).select("_id PropertyName reportReason PropertyDes createdAt");

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No properties found with a report reason",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Properties with report reason retrieved successfully",
      properties,
    });
  } catch (error) {
    console.error("Error retrieving properties with report reason:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put('/property/update-price-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approve" or "reject"

    if (!['approve', 'reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approve" or "reject".',
      });
    }

    // Try updating Property collection first
    let property = await Property.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set PropertyAmount to UpdatePrice and clear UpdatePrice
        property.PropertyAmount = property.UpdatePrice || property.PropertyAmount;
        property.UpdatePrice = '';
      } else {
        // Reject: Clear UpdatePrice only
        property.UpdatePrice = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Price ${status}d successfully`,
        property,
      });
    }

    // If not found in Property, try SaleProperty
    property = await SaleProperty.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set PropertyAmount to UpdatePrice and clear UpdatePrice
        property.PropertyAmount = property.UpdatePrice || property.PropertyAmount;
        property.UpdatePrice = '';
      } else {
        // Reject: Clear UpdatePrice only
        property.UpdatePrice = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Price ${status}d successfully`,
        property,
      });
    }

    // If not found in either collection
    return res.status(404).json({
      success: false,
      message: 'Property not found',
    });
  } catch (error) {
    console.error(`Error updating price status:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Route to handle Report Approve/Reject
router.put('/property/update-report-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approve" or "reject"

    if (!['approve', 'reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approve" or "reject".',
      });
    }

    // Try updating Property collection first
    let property = await Property.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set reportList to true and clear reportReason
        property.reportList = true;
        property.reportReason = '';
      } else {
        // Reject: Clear reportReason only
        property.reportReason = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Report ${status}d successfully`,
        property,
      });
    }

    // If not found in Property, try SaleProperty
    property = await SaleProperty.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set reportList to true and clear reportReason
        property.reportList = true;
        property.reportReason = '';
      } else {
        // Reject: Clear reportReason only
        property.reportReason = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Report ${status}d successfully`,
        property,
      });
    }

    // If not found in either collection
    return res.status(404).json({
      success: false,
      message: 'Property not found',
    });
  } catch (error) {
    console.error(`Error updating report status:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.put('/property/update-price-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approve" or "reject"

    if (!['approve', 'reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approve" or "reject".',
      });
    }

    // Try updating Property collection first
    let property = await Property.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set PropertyAmount to UpdatePrice and clear UpdatePrice
        property.PropertyAmount = property.UpdatePrice || property.PropertyAmount;
        property.UpdatePrice = '';
      } else {
        // Reject: Clear UpdatePrice only
        property.UpdatePrice = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Price ${status}d successfully`,
        property,
      });
    }

    // If not found in Property, try SaleProperty
    property = await SaleProperty.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set PropertyAmount to UpdatePrice and clear UpdatePrice
        property.PropertyAmount = property.UpdatePrice || property.PropertyAmount;
        property.UpdatePrice = '';
      } else {
        // Reject: Clear UpdatePrice only
        property.UpdatePrice = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Price ${status}d successfully`,
        property,
      });
    }

    // If not found in either collection
    return res.status(404).json({
      success: false,
      message: 'Property not found',
    });
  } catch (error) {
    console.error(`Error updating price status:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Route to handle Report Approve/Reject
router.put('/property/update-report-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approve" or "reject"

    if (!['approve', 'reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approve" or "reject".',
      });
    }

    // Try updating Property collection first
    let property = await Property.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set reportList to true and clear reportReason
        property.reportList = true;
        property.reportReason = '';
      } else {
        // Reject: Clear reportReason only
        property.reportReason = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Report ${status}d successfully`,
        property,
      });
    }

    // If not found in Property, try SaleProperty
    property = await SaleProperty.findById(id);
    if (property) {
      if (status === 'approve') {
        // Set reportList to true and clear reportReason
        property.reportList = true;
        property.reportReason = '';
      } else {
        // Reject: Clear reportReason only
        property.reportReason = '';
      }
      await property.save();
      return res.status(200).json({
        success: true,
        message: `Report ${status}d successfully`,
        property,
      });
    }

    // If not found in either collection
    return res.status(404).json({
      success: false,
      message: 'Property not found',
    });
  } catch (error) {
    console.error(`Error updating report status:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
