const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DoctorSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false
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
    pmdcNumber: {
      type: String,
      default: "",
    },
    chargePerHour: {
      type: String,
      default: "",
    },
    speciality: {
      type: String,
      default: "",
    },
    timeSlot: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default:
        "http://res.cloudinary.com/dmsus6w9v/image/upload/v1675019086/tl3hkggv7vljzpl37b5e.webp",
    },
    address: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      default: "",
    },
    Prescription: [
      {
        patientEmail: {
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
        doctorName: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    appointmentRequests: [
      {
        state: {
          type: String, //ACCPETED, PENDING, DECLINED
          required: true,
        },
        videoConferenceLink: {
          type: String,
          required: false,
          default: "N/A",
        },
        Prescripton: {
          type: String,
          required: false,
          default: "N/A",
        },
        patientEmail: {
          type: String,
          required: true,
        },
        doctorId: {
          type: String,
          required: true,
        },
        doctorName: {
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
        Details: {
          type: String,
          required: true,
        },
        Date_Requested: {
          type: String,
          required: true,
        },
        Time_Requested: {
          type: String,
          required: true,
        }
      },
    ],
    timeSlot: [
      {
        time: {
          type: String,
        },
        booked: {
          type: Boolean,
          default: false
        }
      },
    ],
  },
  { strict: true, timestamps: true }
);

//mongoose.connect('mongodb://localhost:27017/wallet', {useNewUrlParser: true, useUnifiedTopology: true});

//const User = mongoose.model('user', { name: String, email : String, pass : String, verified : Boolean });

module.exports = mongoose.model("Doctor", DoctorSchema);
