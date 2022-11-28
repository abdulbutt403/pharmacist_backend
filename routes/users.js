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
      result = await Patient.create({ email, password, fullName });
      success = true;
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
      });
      success = true;
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
      });
      success = true;
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
  }

  if (!found)
    return res.status(401).json({
      message: "WRONG EMAIL OR PASSWORD",
    });

  delete found.password;

  let payload = {};

  payload.role = role;
  payload.id = found._id;
  payload.name = found.fullName;
  payload.email = found.email;

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

router.get("/pharmacy", async (req, res) => {
  let result = await Pharmacist.find();
  res.json({ result });
});

router.get("/labs", async (req, res) => {
  let result = await Lab.find();
  res.json({ result });
});

router.post("/addMedicine", async (req, res) => {
  const { pharmacyId, Title, Quantity, Identifier, Price } = req.body;
  try {
    let test = await Pharmacist.findById(pharmacyId);

    if (test.Medicines.some((e) => e.Title === Title)) {
      res.send("Already Exist");
    } else {
      test.Medicines.unshift({ Title, Quantity, Price, Identifier });
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

  res.json({ orders: patient.orders });
});

router.post("/requestsByPatient", async (req, res) => {
  console.log(req.body);
  let patient = await Patient.findOne({ email: req.body.patientEmail });

  res.json({ orders: patient.samplingRequests });
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

router.post("/editPharmacy", async (req, res) => {
  const { pharmacyId, email, password, fullName, address } = req.body;
  filter = { _id: pharmacyId };
  update = { email, password, fullName, address };
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

router.post("/editLab", async (req, res) => {
  const { labId, email, password, fullName, address } = req.body;
  filter = { _id: labId };
  update = { email, password, fullName, address };
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

module.exports = router;
