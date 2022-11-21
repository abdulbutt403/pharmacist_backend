const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportsSchema = new Schema(
  {
    Identifier: {
      type: String,
      required: true,
    },
    Image: {
      type: String,
      required: true,
    },
    
  },
  { strict: true, timestamps: true }
);

//mongoose.connect('mongodb://localhost:27017/wallet', {useNewUrlParser: true, useUnifiedTopology: true});

//const User = mongoose.model('user', { name: String, email : String, pass : String, verified : Boolean });

module.exports = mongoose.model("Reports", ReportsSchema);
