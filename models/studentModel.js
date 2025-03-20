import mongoose, { SchemaTypes } from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

// const StudentSchema = mongoose.Schema({
//   _id: String,
//   name: String,
//   birthdate: Date,
//   gender: String,
//   class_year: Number,
//   program: { type: String, ref: "Program" },
//   address: String,
//   email: String,
//   phone_number: String,
//   status: { type: String, ref: "Status" },
//   major: { type: String, ref: "Major" }
// });

//Minh Phuong modified the Student structure according to the new requirements for addresses and PersonInfo
const AddressSchema = mongoose.Schema({
    house_number_street: String,
    ward_commune: String,
    district: String,
    province_city: String,
    country: String,
});

const StudentSchema = mongoose.Schema({
    _id: String, // MSSV
    name: { type: String, required: true },
    birthdate: { type: Date, required: true },
    gender: { type: String, enum: ['Nam', 'Nữ'], required: true },
    class_year: { type: Number, required: true },
    program: { type: String, ref: "Program", required: true },
    permanent_address: AddressSchema, // Địa chỉ thường trú
    temporary_address: AddressSchema, // Địa chỉ tạm trú (optional)
    mailing_address: AddressSchema, // Địa chỉ nhận thư (optional)
    // identification: {
    //     type: { type: String, enum: ['IdentityCard', 'Passport'], required: true },
    //     id: { type: String, refPath: 'identification.type' } // Dynamic reference to IdentityCard or Passport
    // },
    identification: {
        type: {
            type: String, 
            enum: ['IdentityCard', 'Passport'], 
            required: true
        },
        id: { type: String, required: true },
        issue_date: { type: Date, required: true },
        expiry_date: { type: Date, required: true },
        issue_location: { type: String, required: true },
        is_digitized: { type: Boolean, default: false } // Only for CCCD
    },
    nationality: { type: String, required: true }, // new field of nationality
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    status: { type: String, ref: "Status", required: true },
    major: { type: String, ref: "Major", required: true }
});

StudentSchema.plugin(paginate);
StudentSchema.plugin(aggregatePaginate);
const Student = mongoose.model("Student", StudentSchema, "students");
export default Student;

