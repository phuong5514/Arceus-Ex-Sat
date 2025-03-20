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
    type: { type: String, enum: ['CMND', 'CCCD'], required: true }, // CMND or CCCD
    number: { type: String, required: true }, // Identity number
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    issue_location: { type: String, required: true },
    is_digitized: { type: Boolean, default: false } // Only for CCCD
});

const IdentityCard = mongoose.model("IdentityCard", IdentityCardSchema, "identity_cards");
export default IdentityCard;