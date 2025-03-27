import mongoose, { SchemaTypes } from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const AddressSchema = mongoose.Schema({
    _id: String,
    house_number: String,
    street: String,
    ward: String, // Phường, xã
    district: String,
    city: String,
    country: String,
    postal_code: String
});

AddressSchema.plugin(paginate);
AddressSchema.plugin(aggregatePaginate);

const Address = mongoose.model("Address", AddressSchema, "addresses");

export default Address;
