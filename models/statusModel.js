import mongoose from "mongoose";

const StatusSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  status_name: {
    type: String,
    required: true
  }
});

// Tạo danh sách trạng thái mặc định nếu chưa có
StatusSchema.statics.createDefaultStatuses = async function() {
  const defaultStatuses = [
    { _id: "TTDH", status_name: "Đang học" },
    { _id: "TTTH", status_name: "Đã thôi học" },
    { _id: "TTTN", status_name: "Đã tốt nghiệp" },
    { _id: "TTTD", status_name: "Tạm dừng học" }
  ];

  try {
    const count = await this.countDocuments();
    if (count === 0) {
      await this.insertMany(defaultStatuses);
      console.log('Created default statuses');
    }
  } catch (error) {
    console.error('Error creating default statuses:', error);
  }
};

const Status = mongoose.model("Status", StatusSchema, "status");

// Tạo dữ liệu mặc định khi khởi động
Status.createDefaultStatuses();

export default Status;
