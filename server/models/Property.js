const AutoIncrementFactory = require('mongoose-sequence');
const mongoose = require('mongoose');
const AutoIncrement = AutoIncrementFactory(mongoose);

// Define the schema for the Property model
const PropertySchema = new mongoose.Schema({
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
  increateAmount:{
    type: Number,
  },
  increateStatus:{
    type: String,
    enum:["noRequested","panding","accepted",'rejected'],
    default:"noRequested"
  },
  propertId:{
    type: String,

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
  isFavorite: {
    type: Boolean,
    default: false,
  },
  inverter1:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_authentication",
  },

  inverter1Amount:{
    type: String,
    default: "",
  },
  inverter1Sale:{
    type: Boolean,
    default: false,
  },
  inverter2:{
    // type: mongoose.Schema.Types.ObjectId,
    type: String,
    default: "",
    // ref: "user_authentication",
  },
  inverter2Amount:{
    type: String,
    default: "",
  },
  nftId: { type: Number, required: true },
  inverter2Sale:{
    type: Boolean,
    default: false,
  },
  ownerOne:{
    type : Boolean,
    default : false,
  },
  ownerTwo:{
    type : Boolean,
    default : false,
  },
  ownerOneAddress:{
    type : String,
    default : "",
  },
  ownerTwoAddress:{
    type : String,
    default : "",
  },
  reportList:{
    type:Boolean,
    default: false,
  },
  reportReason:{
    type: String,
    default: "",
  },
  UpdatePrice:{
    type:String,
    default: "",
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
PropertySchema.plugin(AutoIncrement, { inc_field: 'propertyId' });
// Export the model
module.exports = mongoose.model("Property", PropertySchema);
