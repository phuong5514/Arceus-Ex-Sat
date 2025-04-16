import Course from "../models/course-model.js";

export const createCourse = async (req, res) => {
  try {
    const { code, name, credits, department, description, prerequisite } = req.body;

    if (credits < 2) {
      return res.status(400).json({ message: "Số tín chỉ phải >= 2." });
    }

    if (prerequisite) {
      const exists = await Course.findOne({ code: prerequisite });
      if (!exists) {
        return res.status(400).json({ message: "Môn tiên quyết không tồn tại." });
      }
    }

    const course = new Course({
      code,
      name,
      credits,
      department,
      description,
      prerequisite: prerequisite || null,
      isDeactivated: false,
      createdAt: new Date()
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { code } = req.params;
    const { name, description, department } = req.body;

    const course = await Course.findOne({ code });
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học." });

    course.name = name || course.name;  
    course.description = description || course.description;
    course.department = department || course.department;

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { code } = req.params;

    const course = await Course.findOne({ code });
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học." });

    const now = new Date();
    const diffMinutes = (now - course.createdAt) / (1000 * 60);

    if (diffMinutes > 30) {
      return res.status(403).json({ message: "Chỉ có thể xóa trong vòng 30 phút sau khi tạo." });
    }

    // TODO: kiểm tra chưa có lớp học mở – chỗ này placeholder
    const hasClasses = false; // giả sử kiểm tra sau này

    if (hasClasses) {
      return res.status(403).json({ message: "Đã có lớp học mở. Không thể xóa." });
    }

    await Course.deleteOne({ code });
    res.json({ message: "Xóa khóa học thành công." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deactivateCourse = async (req, res) => {
  try {
    const { code } = req.params;

    const course = await Course.findOne({ code });
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học." });

    course.isDeactivated = true;
    await course.save();

    res.status(200).json({ message: "Khóa học đã được đánh dấu là không còn được mở." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
