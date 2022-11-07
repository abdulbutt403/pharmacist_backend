const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LabSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    reports: [
      {
        patientName: {
          type: String,
          required: true,
        },
        examinedDate: {
          type: String,
          required: true,
        },
        result: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { strict: true, timestamps: true }
);

//mongoose.connect('mongodb://localhost:27017/wallet', {useNewUrlParser: true, useUnifiedTopology: true});

//const User = mongoose.model('user', { name: String, email : String, pass : String, verified : Boolean });

module.exports = mongoose.model("Lab", LabSchema);
