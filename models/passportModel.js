import mongoose from "mongoose";

// const PassportSchema = mongoose.Schema({
//     _id: String,
//     type: String,
//     country_code: String,
//     passport_number: String,
//     issue_date: Date,
//     expiry_date: Date,
//     issue_location: String,
// });

// const Passport = mongoose.model("Passport", PassportSchema);

// export default Passport;

//Minh Phuong clarified a little bit

const PassportSchema = mongoose.Schema({
    _id: String,
    type: String,
    country_code: String,
    // passport_number: String, HP: ignored, use _id instead
    issue_date: Date,
    expiry_date: Date,
    issue_location: String,
    notes: { type: String } // Optional notes field, not in use yet
});
const Passport = mongoose.model("Passport", PassportSchema, "passports");
export default Passport;