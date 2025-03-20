import mongoose from "mongoose";

const ProgramSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  program_name: {
    type: String,
    required: true
  }
});

// Tạo danh sách chương trình học mặc định nếu chưa có
ProgramSchema.statics.createDefaultPrograms = async function() {
  const defaultPrograms = [
    { _id: "CTDT", program_name: "Đại trà" },
    { _id: "CTTN", program_name: "Tài năng" },
    { _id: "CTTT", program_name: "Tiên tiến" },
    { _id: "CTCLC", program_name: "Chất lượng cao" }
  ];

  try {
    const count = await this.countDocuments();
    if (count === 0) {
      await this.insertMany(defaultPrograms);
      console.log('Created default programs');
    }
  } catch (error) {
    console.error('Error creating default programs:', error);
  }
};

const Program = mongoose.model("Program", ProgramSchema, "programs");

// Tạo dữ liệu mặc định khi khởi động
Program.createDefaultPrograms();

export default Program;
