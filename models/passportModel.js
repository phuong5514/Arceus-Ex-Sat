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
    type: { type: String, default: 'Passport' }, // Fixed as "Passport"
    country_code: { type: String, required: true }, // e.g., "VN" for Vietnam
    passport_number: { type: String, required: true },
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    issue_location: { type: String, required: true },
    notes: { type: String } // Optional notes field
});
const Passport = mongoose.model("Passport", PassportSchema, "passports");
export default Passport;