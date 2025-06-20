import Major from "../models/major-model.js";
import Status from "../models/status-model.js";
import Program from "../models/program-model.js";

import return_error from "../helpers/error-handler.js";
import t from "../helpers/translator.js";

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
            throw Error(t(res.locals.t, "major_already_exists"));
        }
        const newMajor = new Major({ _id: id, major_name: name });
        await newMajor.save();
        res.status(200).json({ ok: true, message: t(res.locals.t, "add_major_success") });
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const addStatus = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (await Status.exists({ _id: id }) != null) {
            throw Error(t(res.locals.t, "status_already_exists"));
        }
        const newStatus = new Status({ _id: id, status_name: name });
        await newStatus.save();
        res.status(200).json({ ok: true, message: t(res.locals.t, "add_status_success") });
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const addProgram = async (req, res) => {
    try {
        const { id, name } = req.body;
        if (await Program.exists({ _id: id }) != null) {
            throw Error(t(res.locals.t, "program_already_exists"));
        }
        const newProgram = new Program({ _id: id, program_name: name });
        await newProgram.save();
        res.status(200).json({ ok: true, message: t(res.locals.t, "add_program_success") });
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

// Delete items
export const deleteMajor = async (req, res) => {
    try {
        const result = await Major.findOneAndDelete({ _id: req.params.id }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error(t(res.locals.t, "major_not_found", req.params.id));
        } else {
            res.status(200).json({ ok: true, message: t(res.locals.t, "delete_major_success") });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const deleteStatus = async (req, res) => {
    try {
        const result = await Status.findOneAndDelete({ _id: req.params.id }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error(t(res.locals.t, "status_not_found", req.params.id));
        } else {
            res.status(200).json({ ok: true, message: t(res.locals.t, "delete_status_success") });
        }
    } catch (error) {
        return_error(res, 400, error.message);
    }
};

export const deleteProgram = async (req, res) => {
    try {
        const result = await Program.findOneAndDelete({ _id: req.params.id }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error(t(res.locals.t, "program_not_found", req.params.id));
        } else {
            res.status(200).json({ ok: true, message: t(res.locals.t, "delete_program_success") });
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
            throw new Error(t(res.locals.t, "major_not_found", id));
        } else {
            res.status(200).json({ ok: true, message: t(res.locals.t, "rename_major_success") });
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
            throw new Error(t(res.locals.t, "status_not_found", id));
        } else {
            res.status(200).json({ ok: true, message: t(res.locals.t, "rename_status_success") });
        }
    } catch (error) {
        res.status(400).json({ ok: false, message: t(res.locals.t, "rename_status_failed") });
    }
};

export const renameProgram = async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name;
        const result = await Program.findOneAndUpdate({ _id: id }, { program_name: name }, { includeResultMetadata: true });
        if (!result.ok) {
            throw new Error(t(res.locals.t, "program_not_found", id));
        } else {
            res.status(200).json({ ok: true, message: t(res.locals.t, "rename_program_success") });
        }
    } catch (error) {
        res.status(400).json({ ok: false, message: t(res.locals.t, "rename_program_failed") });
    }
};
