import Major from "../models/majorModel.js";
import Status from "../models/statusModel.js";
import Program from "../models/programModel.js";

// Load the manage dropdown page
export const getDropdowns = async (req, res) => {
    try {
        const majors = await Major.find().lean();
        const status = await Status.find().lean();
        const programs = await Program.find().lean();

        res.render("manageDropdowns", { majors, status, programs });
    } catch (error) {
        console.error(" Error getting dropdowns:", error.message);
        res.status(500).json({ error: "Lỗi lấy danh sách" });
    }
};

// Add new items
export const addMajor = async (req, res) => {
    try {
        const { name } = req.body;
        const newMajor = new Major({ _id: name.toUpperCase(), major_name: name });
        await newMajor.save();
        res.status(201).json({ message: "Thêm Khoa thành công!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const addStatus = async (req, res) => {
    try {
        const { name } = req.body;
        const newStatus = new Status({ _id: name.toUpperCase(), status_name: name });
        await newStatus.save();
        res.status(201).json({ message: "Thêm tình trạng thành công!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const addProgram = async (req, res) => {
    try {
        const { name } = req.body;
        const newProgram = new Program({ _id: name.toUpperCase(), program_name: name });
        await newProgram.save();
        res.status(201).json({ message: "Thêm chương trình thành công!" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete items
export const deleteMajor = async (req, res) => {
    await Major.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa Khoa thành công!" });
};

export const deleteStatus = async (req, res) => {
    await Status.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa tình trạng thành công!" });
};

export const deleteProgram = async (req, res) => {
    await Program.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa chương trình thành công!" });
};
