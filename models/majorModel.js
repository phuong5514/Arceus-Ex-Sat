import mongoose from "mongoose";

const majorSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    major_name: {
        type: String,
        required: true
    }
});

// Tạo danh sách ngành học mặc định nếu chưa có
majorSchema.statics.createDefaultMajors = async function() {
    const defaultMajors = [
        { _id: "KHOATATM", major_name: "Tiếng Anh Thương mại" },
        { _id: "KHOALUAT", major_name: "Luật" },
        { _id: "KHOANHAT", major_name: "Tiếng Nhật" },
        { _id: "KHOAPHAP", major_name: "Tiếng Pháp" }
    ];

    try {
        const count = await this.countDocuments();
        if (count === 0) {
            await this.insertMany(defaultMajors);
            console.log('Created default majors');
        }
    } catch (error) {
        console.error('Error creating default majors:', error);
    }
};

const Major = mongoose.model("Major", majorSchema);

// Tạo dữ liệu mặc định khi khởi động
Major.createDefaultMajors();

export default Major;
