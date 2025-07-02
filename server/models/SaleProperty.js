const AutoIncrementFactory = require('mongoose-sequence');
const mongoose = require('mongoose');

// Define the schema for the Property model
const SalePropertySchema = new mongoose.Schema({
  PropertyName: {
    type: String,
    required: true,
  },
  PropertyImage: {
    type: String, // Store the file path or URL of the image
    required: false,
  },
  metamask_Address: {
    type: String,
    required: false,
  },
  PropertyDocument: {
    type: String, // Store the file path or URL of the document
    required: false,
  },
  increateAmount: {
    type: Number,
  },
  increateStatus: {
    type: String,
    enum: ["noRequested", "panding", "accepted", 'rejected'],
    default: "noRequested"
  },
  propertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },
  PropertyAmount: {
    type: Number,
    required: true,
  },
  PropertyDes: {
    type: String,
    required: true,
  },
  ownername: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_authentication",
  },
  inverterType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_authentication",
  },
  nftId: { type: Number, required: true },
  inverter1: { type: String, default:"" }, // Store address or user ID
  inverter1Amount: { type: Number, default: "" },
  inverter2: { type: String,  default:"" }, // Store address or user ID
  inverter2Amount: { type: Number, default: "" },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isSale: {
    type: Boolean,
    default: false,
  },
  ownerOne:{
    type : Boolean,
    default : false,
  },
  ownertwo:{
    type : Boolean,
    default : false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
module.exports = mongoose.model("SaleProperty", SalePropertySchema);
