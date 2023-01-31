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
    code: {
      type: String,
      default: "000000",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "http://res.cloudinary.com/dmsus6w9v/image/upload/v1675140015/dbc6n2ricyveswog9h7h.jpg",
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
    samplingRequests: [
      {
        state: {
          type: String, //PENDING,DELIVERED
          required: true,
        },
        patientEmail: {
          type: String,
          required: true,
        },
        labId: {
          type: String,
          required: true,
        },
        labName: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        Identifier: {
          type: String,
          required: true,
        },
        Reason: {
          type: String,
          required: true,
        },
        Date_Requested: {
          type: String,
          required: true,
        },
      },
    ],
    tests: [
      {
        title: {
          type: String, //PENDING,DELIVERED
          required: true,
        },
        description: {
          type: String, //PENDING,DELIVERED
          required: true,
        },
        price: {
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
