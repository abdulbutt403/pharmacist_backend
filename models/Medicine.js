const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MedicineSchema = new Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Quantity: {
      type: Number,
      required: true,
    },
    Price: {
      type: Number,
      default: true,
    },
  },
  { strict: true, timestamps: true }
);

//mongoose.connect('mongodb://localhost:27017/wallet', {useNewUrlParser: true, useUnifiedTopology: true});

//const User = mongoose.model('user', { name: String, email : String, pass : String, verified : Boolean });

module.exports = mongoose.model("Medicine", MedicineSchema);
