import mongoose from "mongoose";

//Minh Phuong clarified a little bit

const PassportSchema = mongoose.Schema({
    _id: String,
    type: String,
    country_code: String,
    // passport_number: String, HP: ignored, use _id instead
    issue_date: Date,
    expiry_date: Date,
    issue_location: String,
    notes: { type: String }
});
const Passport = mongoose.model("Passport", PassportSchema, "passports");
export default Passport;