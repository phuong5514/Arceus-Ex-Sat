import Major from "../models/major-model.js";
import Status from "../models/status-model.js";
import Program from "../models/program-model.js";

import return_error from "../helpers/error-handler.js";

// Load the manage dropdown page
export const getDropdowns = async (_req, res) => {
    try {
        const majors = await Major.find().lean();
        const status = await Status.find().lean();
        const programs = await Program.find().lean();

        res.render("category", { majors, status, programs });
    } catch (error) {
        return_error(res, 500, `Error getting dropdowns: ${error.message}`, true);
    }
};

// Add new items
export const addMajor = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (await Major.exists({ _id: id }) != null) {
            throw Error("Khoa đã tồn tại!");
        }
        const newMajor = new Major({ _id: id, major_name: name });
        await newMajor.save();
        res.status(201).json({ ok: true, message: "" });
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const addStatus = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (await Status.exists({ _id: id }) != null) {
            throw Error("Trạng thái đã tồn tại!");
        }
        const newStatus = new Status({ _id: id, status_name: name });
        await newStatus.save();
        res.status(201).json({ ok: true, message: "" });
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const addProgram = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (await Program.exists({ _id: id }) != null) {
            throw Error("Chương trình đã tồn tại!");
        }
        const newProgram = new Program({ _id: id, program_name: name });
        await newProgram.save();
        res.status(201).json({ ok: true, message: "Thêm chương trình thành công!" });
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

// Delete items
export const deleteMajor = async (req, res) => {
    try {
        const result = await Major.findOneAndDelete({ _id: req.params.id }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error("Không tìm thấy Khoa!");
        } else {
            res.status(200).json({ ok: true, message: "" });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const deleteStatus = async (req, res) => {
    try {
        const result = await Status.findOneAndDelete({ _id: req.params.id }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error("Không tìm thấy Trạng thái!");
        } else {
            res.status(200).json({ ok: true, message: "" });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const deleteProgram = async (req, res) => {
    try {
        const result = await Program.findOneAndDelete({ _id: req.params.id }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error("Không tìm thấy Chương trình!");
        } else {
            res.status(200).json({ ok: true, message: "" });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const renameMajor = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        const result = await Major.findOneAndUpdate({ _id: id }, { major_name: name }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error("Không tìm thấy Khoa!");
        } else {
            res.status(200).json({ ok: true, message: "" });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const renameStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        const result = await Status.findOneAndUpdate({ _id: id }, { status_name: name }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error("Không tìm thấy Trạng thái!");
        } else {
            res.status(200).json({ ok: true, message: "" });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const renameProgram = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        const result = await Program.findOneAndUpdate({ _id: id }, { program_name: name }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error("Không tìm thấy Chương trình!");
        } else {
            res.status(200).json({ ok: true, message: "" });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};
