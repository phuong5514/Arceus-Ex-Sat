import mongoose from "mongoose";

// const IdentityCardSchema = mongoose.Schema({
//     _id: String,
//     issue_date: Date,
//     expiry_date: Date,
//     issue_location: String,
//     is_digitized: Boolean,
// });

// const IdentityCard = mongoose.model("IdentityCard", IdentityCardSchema, "identity_cards");

// export default IdentityCard;

// Minh Phuong modified to use for CMND with CCCD.
const IdentityCardSchema = mongoose.Schema({
    _id: String,
    issue_date: Date,
    expiry_date: Date,
    issue_location: String,
    is_digitized: Boolean,
    chip_attached: Boolean,
});

const IdentityCard = mongoose.model("IdentityCard", IdentityCardSchema, "identity_cards");
export default IdentityCard;