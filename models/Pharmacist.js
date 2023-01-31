const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PharmacistSchema = new Schema(
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
    profilePic: {
      type: String,
      default: "http://res.cloudinary.com/dmsus6w9v/image/upload/v1675138693/wivz6f8afgdrjh0zkg4z.jpg",
    },
    address: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    Medicines: [
      {
        Identifier: {
          type: String,
          required: false,
        },
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
        Prescription: {
          type: Boolean,
          default: false,
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
        Identifier: {
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
  },
  { strict: true, timestamps: true }
);

//mongoose.connect('mongodb://localhost:27017/wallet', {useNewUrlParser: true, useUnifiedTopology: true});

//const User = mongoose.model('user', { name: String, email : String, pass : String, verified : Boolean });

module.exports = mongoose.model("Pharmacist", PharmacistSchema);
