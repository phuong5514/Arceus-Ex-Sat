import mongoose from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const TranscriptSchema = new mongoose.Schema({
  student_id: { type: String, ref: "Student", required: true },
  class_id: { type: String, ref: "Class", required: true },
  grade: { type: Number, min: 0, max: 10, required: true },
  recorded_at: { type: Date, default: Date.now }
});

TranscriptSchema.plugin(paginate);
TranscriptSchema.plugin(aggregatePaginate);

const Transcript = mongoose.model("Transcript", TranscriptSchema, "transcripts");
export default Transcript;
