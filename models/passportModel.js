import mongoose from "mongoose";

const PassportSchema = mongoose.Schema({
    _id: String,
    type: String,
    country_code: String,
    passport_number: String,
    issue_date: Date,
    expiry_date: Date,
    issue_location: String,
});

const Passport = mongoose.model("Passport", PassportSchema);

export default Passport;
