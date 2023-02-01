var express = require("express");
var router = express.Router();
var Lab = require("../models/Lab");
var Patient = require("../models/Patient");
var Reports = require("../models/Reports");
var Pharmacist = require("../models/Pharmacist");
var Prescription = require("../models/Prescription");
const jwt = require("jsonwebtoken");
const config = require("config"); //load config module
const { default: mongoose } = require("mongoose");
const jwtToken = config.get("jwtsecret");
const transporter = require("../config/emailconfig");
const Doctor = require("../models/Doctor");

router.post("/create", async (req, res) => {
  const { email, password, role, fullName } = req.body;
  var result = {};
  var success = false;
  var msg = "";
  console.log({ role });

  if (role === "PATIENT") {
    let found = await Patient.findOne({ email });
    if (found) {
      (success = false), (msg = "Patient already exist");
    } else {
      result = await Patient.create({
        email,
        password,
        fullName,
        address: req.body?.address,
        phoneNumber: req.body?.phoneNumber,
      });
      if (result) {
        await sendCodePatient(email);
        success = true;
      }
    }
  } else if (role === "PHARMACIST") {
    let found = await Pharmacist.findOne({ email });
    if (found) {
      (success = false), (msg = "Pharmacist already exist");
    } else {
      result = await Pharmacist.create({
        email,
        password,
        fullName,
        address: req.body?.address,
        phoneNumber: req.body?.phoneNumber,
      });
      if (result) {
        await sendCodePharmacy(email);
        success = true;
      }
    }
  } else if (role === "LAB") {
    let found = await Lab.findOne({ email });
    if (found) {
      (success = false), (msg = "Lab already exist");
    } else {
      result = await Lab.create({
        email,
        password,
        fullName,
        address: req.body?.address,
        phoneNumber: req.body?.phoneNumber,
      });
      if (result) {
        await sendCodeLab(email);
        success = true;
      }
    }
  } else if (role === "DOCTOR") {
    let found = await Doctor.findOne({ email });
    if (found) {
      (success = false), (msg = "Doctor already exist");
    } else {
      result = await Doctor.create({
        email,
        password,
        fullName,
        address: req.body?.address,
        phoneNumber: req.body?.phoneNumber,
      });
      if (result) {
        await sendCodeDoctor(email);
        success = true;
      }
    }
  }

  return res.json({ result, success, msg });
});

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  var found = null;
  console.log({ role });
  if (role === "PATIENT") {
    found = await Patient.findOne({ email, password });
  } else if (role === "PHARMACIST") {
    found = await Pharmacist.findOne({ email, password });
  } else if (role === "LAB") {
    found = await Lab.findOne({ email, password });
  } else if (role === "DOCTOR") {
    found = await Doctor.findOne({ email, password });
  } else if (role === "ADMIN") {
     
    if(email === 'hafizbutt022@gmail.com' && password === '12345678'){
      let payload = {};

      payload.role = role;
      payload.name = 'ADMIN';
      payload.email = 'hafizbutt022@gmail.com';
    
      jwt.sign(payload, jwtToken, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        return res.status(200).json({ token });
      });

      return;
    }
  }

  if (!found)
    return res.status(401).json({
      message: "WRONG EMAIL OR PASSWORD",
    });

  if (found && !found.isVerified)
    return res.status(401).json({
      message: "Not Verified",
    });



  if (found && found.isBlocked)
  return res.status(401).json({
    message: "Account Blocked",
  });


  delete found.password;

  let payload = {};

  payload.role = role;
  payload.id = found._id;
  payload.name = found.fullName;
  payload.email = found.email;
  payload.address = found.address;

  jwt.sign(payload, jwtToken, { expiresIn: 360000 }, (err, token) => {
    if (err) throw err;
    res.status(200).json({ token });
  });
});

router.post("/addpharmacy", async (req, res) => {
  const { email, password, address, fullName, Medicines } = req.body;
  let result = await Pharmacist.create({ email, password, fullName, address });
  res.send({ result });
});

router.post("/verify", async (req, res) => {
  let success = false;
  try {
    const { email, code, role } = req.body;

    if (role === "PATIENT") {
      let result = await Patient.findOne({ email });
      if (result) {
        if (result.code === code) {
          result.isVerified = true;
          await result.save();
          success = true;
        }
      }
    } else if (role === "PHARMACIST") {
      let result = await Pharmacist.findOne({ email });
      if (result) {
        if (result.code === code) {
          result.isVerified = true;
          await result.save();
          success = true;
        }
      }
    } else if (role === "LAB") {
      let result = await Lab.findOne({ email });
      if (result) {
        if (result.code === code) {
          result.isVerified = true;
          await result.save();
          success = true;
        }
      }
    } else if (role === "DOCTOR") {
      let result = await Doctor.findOne({ email });
      if (result) {
        if (result.code === code) {
          result.isVerified = true;
          await result.save();
          success = true;
        }
      }
    }

    if (!success) {
      return res.json({ success, msg: "Verification was not successful" });
    } else {
      return res.json({ success, msg: "Verification Successful !" });
    }
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/pharmacy", async (req, res) => {
  let result = await Pharmacist.find({ isBlocked: false });
  res.json({ result });
});

router.get("/pharmacyLimit", async (req, res) => {
  let result = await Pharmacist.find({ isBlocked: false }).limit(3);
  res.json({ result });
});

router.get("/doctors", async (req, res) => {
  let result = await Doctor.find({ isBlocked: false });
  res.json({ result });
});

router.get("/doctorsLimit", async (req, res) => {
  let result = await Doctor.find({ isBlocked: false }).limit(3);
  res.json({ result });
});

router.get("/labs", async (req, res) => {
  let result = await Lab.find({ isBlocked: false });
  res.json({ result });
});

router.get("/labsLimit", async (req, res) => {
  let result = await Lab.find({ isBlocked: false }).limit(3);
  res.json({ result });
});

router.get("/patients", async (req, res) => {
  let result = await Patient.find();
  res.json({ result });
});

router.post("/addMedicine", async (req, res) => {
  const { pharmacyId, Title, Quantity, Identifier, Price, Prescription } =
    req.body;
  try {
    let test = await Pharmacist.findById(pharmacyId);

    if (test.Medicines.some((e) => e.Title === Title)) {
      res.send("Already Exist");
    } else {
      test.Medicines.unshift({
        Title,
        Quantity,
        Price,
        Identifier,
        Prescription,
      });
      await test.save();
      res.status(200).send("Medicine Entered.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/order", async (req, res) => {
  const payload = req.body;

  const {
    state,
    patientEmail,
    pharmacyId,
    pharmacyName,
    Medicines,
    Identifier,
    address,
    phoneNumber,
  } = payload;

  console.log({
    state,
    patientEmail,
    pharmacyId,
    pharmacyName,
    Medicines,
    Identifier,
    address,
    phoneNumber,
  });

  try {
    let pharmacy = await Pharmacist.findById(pharmacyId);
    if (pharmacy) {
      pharmacy.orders.unshift({
        state,
        patientEmail,
        pharmacyId,
        pharmacyName,
        Medicines,
        Identifier,
        address,
        phoneNumber,
      });
    }
    let patient = await Patient.findOne({ email: patientEmail });
    if (patient) {
      patient.orders.unshift({
        state,
        patientEmail,
        pharmacyId,
        pharmacyName,
        Medicines,
        Identifier,
        address,
        phoneNumber,
      });
    }

    const svaed1 = await pharmacy.save();
    const saved2 = await patient.save();

    res.json({ success: true, pharmacy: svaed1, patient: saved2 });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/booking_request", async (req, res) => {
  const payload = req.body;

  const {
    doctorId,
    doctorName,
    Details,
    Date_Requested,
    state,
    patientEmail,
    Identifier,
    Time_Requested
  } = payload;

  try {
    let doctor = await Doctor.findById(doctorId);
    if (doctor) {
      doctor.appointmentRequests.unshift({
        state,
        patientEmail,
        doctorId,
        doctorName,
        Details,
        Identifier,
        Date_Requested,
        Time_Requested
      });
    }
    let patient = await Patient.findOne({ email: patientEmail });
    if (patient) {
      patient.appointmentRequests.unshift({
        state,
        patientEmail,
        doctorId,
        doctorName,
        Details,
        Identifier,
        Date_Requested,
        Time_Requested
      });
    }

    const svaed1 = await doctor.save();
    const saved2 = await patient.save();

    res.json({ success: true, doctor: svaed1, patient: saved2 });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/sample_request", async (req, res) => {
  const payload = req.body;

  const {
    state,
    patientEmail,
    labId,
    labName,
    Identifier,
    Reason,
    Date_Requested,
  } = payload;

  try {
    let lab = await Lab.findById(labId);
    if (lab) {
      lab.samplingRequests.unshift({
        state,
        patientEmail,
        labId,
        labName,
        Identifier,
        Reason,
        Date_Requested,
      });
    }
    let patient = await Patient.findOne({ email: patientEmail });
    if (patient) {
      patient.samplingRequests.unshift({
        state,
        patientEmail,
        labId,
        labName,
        Identifier,
        Reason,
        Date_Requested,
      });
    }

    const svaed1 = await lab.save();
    const saved2 = await patient.save();

    res.json({ success: true, pharmacy: svaed1, patient: saved2 });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/orderByPatient", async (req, res) => {
  console.log(req.body);
  let patient = await Patient.findOne({ email: req.body.patientEmail });

  res.json({ orders: patient ? patient ? patient.orders : [] : [] });
});

router.post("/addSlot", async (req, res) => {
  let doctor = await Doctor.findOne({ email: req.body.doctorEmail });
  const slotExists = doctor.timeSlot.find((s) => s.time === req.body.slot.time);
  if (!slotExists) {
    doctor.timeSlot.push(req.body.slot);
    var svaed1 = await doctor.save();
  }

  res.json({ update: svaed1 ? svaed1 : null });
});

router.post("/getSlots", async (req, res) => {
  let doctor = await Doctor.findOne({ email: req.body.doctorEmail });
  let list2 = [];
  if (doctor) {
    list2 = doctor.timeSlot;
  }

  res.json({ list: list2 });
});

router.post("/deleteSlot", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.id });
    if (!doctor) return res.status(404).send("Doctor not found");

    const slotIndex = doctor.timeSlot.findIndex(s => s._id.toString() === req.body.slotId);
    if (slotIndex === -1) return res.status(400).send("Slot not found");

    doctor.timeSlot.splice(slotIndex, 1);
    const saved = await doctor.save();
    res.send(saved.timeSlot);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.post("/freeSlot", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.id });
    if (!doctor) return res.status(404).send("Doctor not found");

    const slot = doctor.timeSlot.find(s => s._id.toString() === req.body.slotId);
    if (!slot) return res.status(400).send("Slot not found");

    slot.booked = false;
    const saved = await doctor.save();
    res.send(saved.timeSlot);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/requestsByPatient", async (req, res) => {
  console.log(req.body);
  let patient = await Patient.findOne({ email: req.body.patientEmail });

  res.json({ orders: patient.samplingRequests });
});

router.post("/bookingsByPatient", async (req, res) => {
  console.log(req.body);
  let patient = await Patient.findOne({ email: req.body.patientEmail });

  res.json({ orders: patient.appointmentRequests });
});

router.post("/bookingsByDoctor", async (req, res) => {
  let doctor = await Doctor.findOne({ _id: req.body.doctorId });
  res.json({ orders: doctor.appointmentRequests });
});

router.post("/requestsByLab", async (req, res) => {
  console.log(req.body);
  let patient = await Lab.findOne({ _id: req.body.labId });

  console.log(req.body);
  res.json({ orders: patient.samplingRequests });
});

router.post("/orderByPharmacy", async (req, res) => {
  let pharmacy = await Pharmacist.findById(req.body.pharmacyId);
  res.json({ orders: pharmacy.orders });
});

router.post("/medicineByPharmacy", async (req, res) => {
  let pharmacy = await Pharmacist.findById(req.body.pharmacyId);
  res.json({ orders: pharmacy.Medicines });
});

router.post("/orderUpdate", async (req, res) => {
  const { pharmacyId, orderId, status, patientEmail } = req.body;
  let pharmacy = await Pharmacist.findById(pharmacyId);
  let found = pharmacy.orders;
  let idx = found.findIndex((e) => e.Identifier === orderId);
  found[idx].state = status;

  let patient = await Patient.findOne({ email: patientEmail });
  let found2 = patient.orders;
  let idx2 = found2.findIndex((e) => e.Identifier === orderId);
  found2[idx2].state = status;
  let pharmacyUpdate = await pharmacy.save();
  let patientUpdate = await patient.save();
  res.json({ pharmacyUpdate, patientUpdate });
});

router.post("/bookingUpdate", async (req, res) => {
  const { doctorId, orderId, status, patientEmail } = req.body;
  let doctor = await Doctor.findById(doctorId);
  let found = doctor.appointmentRequests;
  let idx = found.findIndex((e) => e.Identifier === orderId);
  found[idx].state = status;

  let patient = await Patient.findOne({ email: patientEmail });
  let found2 = patient.appointmentRequests;
  let idx2 = found2.findIndex((e) => e.Identifier === orderId);
  found2[idx2].state = status;
  let doctorUpdate = await doctor.save();
  let patientUpdate = await patient.save();
  res.json({ doctorUpdate, patientUpdate });
});

router.post("/pressUpdate", async (req, res) => {
  const { Identifier, status } = req.body;
  let found = await Prescription.findOne(Identifier);
  found.status = status;
  let response = await found.save();
  res.json({ response });
});

router.post("/requestUpdate", async (req, res) => {
  const { labId, orderId, status, patientEmail } = req.body;
  let lab = await Lab.findById(labId);
  let found = lab.samplingRequests;
  let idx = found.findIndex((e) => e.Identifier === orderId);
  found[idx].state = status;

  let patient = await Patient.findOne({ email: patientEmail });
  let found2 = patient.samplingRequests;
  let idx2 = found2.findIndex((e) => e.Identifier === orderId);
  found2[idx2].state = status;
  let labUpdate = await lab.save();
  let patientUpdate = await patient.save();
  res.json({ labUpdate, patientUpdate });
});

router.post("/removeMedicine", async (req, res) => {
  const { pharmacyId, Title } = req.body;
  try {
    let test = await Pharmacist.findById(pharmacyId);

    if (test.Medicines.some((e) => e.Title === Title)) {
      let idx = test.Medicines.findIndex((e) => e.Title === Title);
      test.Medicines.splice(idx, 1);
      await test.save();
      res.status(200).send("Successfully Deleted...");
    } else {
      res.status(400).send("Medicine Doesn't Exist.");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/getPharmacy", async (req, res) => {
  const { pharmacyId } = req.body;
  let test = await Pharmacist.findById(pharmacyId);
  res.json(test);
});

router.post("/getPatient", async (req, res) => {
  const { patientEmail } = req.body;
  let test = await Patient.findOne({ email: patientEmail });
  res.json(test);
});

router.post("/getDoctor", async (req, res) => {
  const { doctorEmail } = req.body;
  let test = await Doctor.findOne({ email: doctorEmail });
  res.json(test);
});

router.post("/editPharmacy", async (req, res) => {
  const { pharmacyId, email, password, fullName, address, profilePic } =
    req.body;
  filter = { _id: pharmacyId };
  update = { email, password, fullName, address, profilePic };
  try {
    const response = await Pharmacist.findOneAndUpdate(filter, update);
    console.log(response);
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/editPatient", async (req, res) => {
  const { patientEmail, email, password, fullName, address } = req.body;
  filter = { email: patientEmail };
  update = { email, password, fullName, address };
  try {
    const response = await Patient.findOneAndUpdate(filter, update);
    console.log(response);
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/editDoctor", async (req, res) => {
  const {
    doctorEmail,
    email,
    password,
    fullName,
    address,
    pmdcNumber,
    chargePerHour,
    speciality,
    timeSlot,
    profilePic,
  } = req.body;
  filter = { email: doctorEmail };
  update = {
    email,
    password,
    fullName,
    address,
    pmdcNumber,
    chargePerHour,
    speciality,
    timeSlot,
    profilePic,
  };
  try {
    const response = await Doctor.findOneAndUpdate(filter, update);
    console.log(response);
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/editLab", async (req, res) => {
  const { labId, email, password, fullName, address, profilePic } = req.body;
  filter = { _id: labId };
  update = { email, password, fullName, address, profilePic };
  try {
    const response = await Lab.findOneAndUpdate(filter, update);
    console.log(response);
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/getLab", async (req, res) => {
  const { labId } = req.body;
  let test = await Lab.findOne({ _id: labId });
  res.json(test);
});

router.post("/createReport", async (req, res) => {
  const { Identifier, Image } = req.body;
  try {
    let found = await Reports.findOne({ Identifier });
    if (found) {
      res.send({ success: "duplicate", msg: "Already uploaded" });
    } else {
      result = await Reports.create({ Identifier, Image });
      res.json({ result, success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
});

router.post("/bookingPrescribe", async (req, res) => {
  const { doctorId, orderId, prescribe, patientEmail } = req.body;
  let doctor = await Doctor.findById(doctorId);
  let found = doctor.appointmentRequests;
  let idx = found.findIndex((e) => e.Identifier === orderId);
  found[idx].Prescripton = prescribe;

  let patient = await Patient.findOne({ email: patientEmail });
  let found2 = patient.appointmentRequests;
  let idx2 = found2.findIndex((e) => e.Identifier === orderId);
  found2[idx2].Prescripton = prescribe;
  let doctorUpdate = await doctor.save();
  let patientUpdate = await patient.save();

  try {
    const mailOptions = {
      from: "arrowestates403@gmail.com", // sender address
      to: patientEmail, // list of receivers
      subject: "Doctor Prescription", // Subject line
      html: `Your Doctor named ${doctorUpdate.fullName} has uploaded a prescription for you. Kindly check it on Pharmacist App`,
    };

    transporter.sendMail(mailOptions, async function (err, info) {
      if (err) {
        console.log(err?.toString());
      }
    });
  } catch (error) {
    console.log(error?.toString());
  }

  res.json({ doctorUpdate, patientUpdate });
});

router.post("/bookingCall", async (req, res) => {
  const { doctorId, orderId, videoConferenceLink, patientEmail } = req.body;
  let doctor = await Doctor.findById(doctorId);
  let found = doctor.appointmentRequests;
  let idx = found.findIndex((e) => e.Identifier === orderId);
  found[idx].videoConferenceLink = videoConferenceLink;

  let patient = await Patient.findOne({ email: patientEmail });
  let found2 = patient.appointmentRequests;
  let idx2 = found2.findIndex((e) => e.Identifier === orderId);
  found2[idx2].videoConferenceLink = videoConferenceLink;
  let doctorUpdate = await doctor.save();
  let patientUpdate = await patient.save();

  try {
    const mailOptions = {
      from: "arrowestates403@gmail.com", // sender address
      to: patientEmail, // list of receivers
      subject: "Doctor Video Conference", // Subject line
      html: `Your Doctor named ${doctorUpdate.fullName} has uploaded a meeting link for you. Kindly Join it from ${videoConferenceLink}`,
    };

    transporter.sendMail(mailOptions, async function (err, info) {
      if (err) {
        console.log(err?.toString());
      }
    });
  } catch (error) {
    console.log(error?.toString());
  }

  res.json({ doctorUpdate, patientUpdate });
});

router.post("/createTest", async (req, res) => {
  const { labId, title, description, price } = req.body;
  try {
    let lab = await Lab.findById(labId);
    if (lab) {
      lab.tests.unshift({
        title,
        description,
        price,
      });
    }
    await lab.save();
    res.status(200).send("Test Entered.");
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
});

router.post("/createPrescription", async (req, res) => {
  const {
    Identifier,
    Image,
    patientEmail,
    pharmacyEmail,
    address,
    phoneNumber,
  } = req.body;
  try {
    result = await Prescription.create({
      Identifier,
      Image,
      patientEmail,
      pharmacyEmail,
      address,
      phoneNumber,
      status: "PENDING",
    });
    res.json({ result, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
});

router.post("/getReport", async (req, res) => {
  const { Identifier } = req.body;
  try {
    let found = await Reports.findOne({ Identifier });
    res.json({ found });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
});

router.post("/getPrescrptionForUser", async (req, res) => {
  const { patientEmail } = req.body;
  try {
    let found = await Prescription.find({ patientEmail });
    res.json({ found });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
});

router.post("/getPrescrptionPharmacy", async (req, res) => {
  const { pharmacyEmail } = req.body;
  try {
    let found = await Prescription.find({ pharmacyEmail });
    res.json({ found });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
});

const sendCodePatient = async (email) => {
  let random = Math.floor(Math.random() * 999999);
  try {
    const mailOptions = {
      from: "arrowestates403@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Patient Registeration", // Subject line
      html: `Your verification code is : ${random}`,
    };

    transporter.sendMail(mailOptions, async function (err, info) {
      if (err) {
        console.log(err?.toString());
      } else {
        let found = await Patient.findOne({ email });
        found.code = random;
        await found.save();
      }
    });
  } catch (error) {
    console.log(error?.toString());
  }
};

const sendCodePharmacy = async (email) => {
  let random = Math.floor(Math.random() * 999999);
  try {
    const mailOptions = {
      from: "arrowestates403@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Pharmacy Registeration", // Subject line
      html: `Your verification code is : ${random}`,
    };

    transporter.sendMail(mailOptions, async function (err, info) {
      if (err) {
        console.log(err?.toString());
      } else {
        let found = await Pharmacist.findOne({ email });
        found.code = random;
        await found.save();
      }
    });
  } catch (error) {
    console.log(error?.toString());
  }
};

const sendCodeLab = async (email) => {
  let random = Math.floor(Math.random() * 999999);
  try {
    const mailOptions = {
      from: "arrowestates403@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Lab Registeration", // Subject line
      html: `Your verification code is : ${random}`,
    };

    transporter.sendMail(mailOptions, async function (err, info) {
      if (err) {
        console.log(err?.toString());
      } else {
        let found = await Lab.findOne({ email });
        found.code = random;
        await found.save();
      }
    });
  } catch (error) {
    console.log(error?.toString());
  }
};

const sendCodeDoctor = async (email) => {
  let random = Math.floor(Math.random() * 999999);
  try {
    const mailOptions = {
      from: "arrowestates403@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Doctor Registeration", // Subject line
      html: `Your verification code is : ${random}`,
    };

    transporter.sendMail(mailOptions, async function (err, info) {
      if (err) {
        console.log(err?.toString());
      } else {
        let found = await Doctor.findOne({ email });
        found.code = random;
        await found.save();
      }
    });
  } catch (error) {
    console.log(error?.toString());
  }
};

module.exports = router;




router.get("/pharmacyAdmin", async (req, res) => {
  let result = await Pharmacist.find();
  res.json({ result });
});

router.get("/doctorsAdmin", async (req, res) => {
  let result = await Doctor.find();
  res.json({ result });
});

router.get("/labsAdmin", async (req, res) => {
  let result = await Lab.find();
  res.json({ result });
});


router.post("/block", async (req, res) => {
  try {
    let model;
    switch (req.body.role) {
      case "doctor":
        model = Doctor;
        break;
      case "patient":
        model = Patient;
        break;
      case "lab":
        model = Lab;
        break;
      case "pharmacist":
        model = Pharmacist;
        break;
      default:
        return res.status(400).send("Invalid role");
    }

    const obj = await model.findOne({ _id: req.body.id });
    if (!obj) return res.status(404).send(`${req.body.role} not found`);

    obj.isBlocked = true;
    const saved = await obj.save();
    res.send(saved);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



router.post("/unblock", async (req, res) => {
  try {
    let model;
    switch (req.body.role) {
      case "doctor":
        model = Doctor;
        break;
      case "patient":
        model = Patient;
        break;
      case "lab":
        model = Lab;
        break;
      case "pharmacist":
        model = Pharmacist;
        break;
      default:
        return res.status(400).send("Invalid role");
    }

    const obj = await model.findOne({ _id: req.body.id });
    if (!obj) return res.status(404).send(`${req.body.role} not found`);

    obj.isBlocked = false;
    const saved = await obj.save();
    res.send(saved);
  } catch (error) {
    res.status(500).send(error.message);
  }
});