const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientSchema = new Schema(
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
      default: "000000"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    address: {
      type: String,
      default: "",
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
    orders: [
      {
        state: {
          type: String, //PENDING,DELIVERED
          required: true,
        },
        patientEmail: {
          type: String,
          required: true,
        },
        pharmacyId: {
          type: String,
          required: true,
        },
        pharmacyName: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: false,
        },
        phoneNumber: {
          type: String,
          required: false,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        Identifier: {
          type: String,
          required: true,
        },
        Medicines: [
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
        ],
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
  },
  { strict: true, timestamps: true }
);

//mongoose.connect('mongodb://localhost:27017/wallet', {useNewUrlParser: true, useUnifiedTopology: true});

//const User = mongoose.model('user', { name: String, email : String, pass : String, verified : Boolean });

module.exports = mongoose.model("Patient", PatientSchema);
