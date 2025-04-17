import Course from "../models/course-model.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import Department from "../models/department-model.js";

dayjs.extend(customParseFormat);

const defaultPageLimit = 2; 

export const createCourse = async (req, res) => {
  try {
    const { _id, course_name, credits, department, description, prerequisite_course} = req.body;

    if (credits < 2) {
      return res.status(400).json({ message: "Số tín chỉ phải >= 2." });
    }

    if (prerequisite_course) {
      const exists = await Course.findOne({ _id: prerequisite_course });
      if (!exists) {
        return res.status(400).json({ message: "Môn tiên quyết không tồn tại." });
      }
    }

    const course = new Course({
      _id,
      course_name,
      credits,
      department,
      description,
      prerequisite_course: prerequisite_course || null,
      is_active: true,
      created_at: new Date()
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_name, description, department, is_active} = req.body;

    const course = await Course.findOne({ _id : id });
    if (!course) return res.status(404).json({ message: `Không tìm thấy khóa học với mã ${id}` });

    course.course_name = course_name || course.course_name;  
    course.description = description || course.description;
    course.department = department || course.department;
    course.prerequisite_course = req.body.prerequisite_course || course.prerequisite_course;
    course.credits = req.body.credits || course.credits;
    
    course.is_active = is_active ?? course.is_active;

    await course.save();
    res.status(200).json({ok: true, message: ""});
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ _id : id });
    if (!course) return res.status(404).json({ ok: false, message: `Không tìm thấy khóa học với mã ${id}` });

    const now = new Date();
    const diffMinutes = (now - course.created_at) / (1000 * 60);

    if (diffMinutes > 30) {
      return res.status(403).json({ ok: false, message: `Chỉ có thể xóa trong vòng 30 phút sau khi tạo. Đã ${Math.floor(diffMinutes)} phút.` });
    }

    // TODO: kiểm tra chưa có lớp học mở – chỗ này placeholder
    const hasClasses = false; // giả sử kiểm tra sau này

    if (hasClasses) {
      return res.status(403).json({ ok: false, message: "Đã có lớp học mở. Không thể xóa." });
    }

    await Course.deleteOne({ code });
    res.json({ ok: true, message: "" });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const deactivateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ _id : id });
    if (!course) return res.status(404).json({ok: false, message: `Không tìm thấy khóa học với mã ${id}` });

    course.is_active = false;
    await course.save();

    res.status(200).json({ok: true, message: "" });
  } catch (err) {
    res.status(500).json({ok: false, message: err.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const results = await Course.paginate({}, {
      pagination: true,
      page: req.query.page || 1,
      limit: req.query.limit || defaultPageLimit,
      sort: { created_at: -1 },
      lean: true,
    });

    results.docs.forEach(course => {
      course.created_at.text = dayjs(course.created_at).format("DD/MM/YYYY");
    });

    res.render('course', { title: 'Courses', results });
  } catch (err) {
    res.status(500).json({ok: false, message: err.message });
  }
};

function getAvailableDepartments() {
  return Department.find({}).lean();
}

function getAvailableStatus() {
  return [
    { value: true, text: "Đang mở" },
    { value: false, text: "Không mở" }
  ];
}

function getAvailableCourses() {
  return Course.find({}).lean();
}

export const getCourseDetail = async (req, res) => {
  try{
    const availableDepartments = await getAvailableDepartments(); 
    const availableStatus = getAvailableStatus();
    const availableCourses = await getAvailableCourses();

    const { id } = req.params;
    const course = await Course.findById({_id : id}).lean();
    if (!course) return res.status(404).json({ ok: false, message: `Không tìm thấy khóa học với mã ${id}` });
    res.render('course-detail', {course, status: availableStatus, departments: availableDepartments, prerequisite_courses: availableCourses});
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

export const getCourseDetailEdit = async (req, res) => {
  try{
    const availableDepartments = await getAvailableDepartments(); 
    const availableStatus = getAvailableStatus();
    const availableCourses = await getAvailableCourses();

    const { id } = req.params;
    const course = await Course.findById({_id : id}).lean();
    if (!course) return res.status(404).json({ ok: false, message: `Không tìm thấy khóa học với mã ${id}` });
    res.render('course-detail-edit', {course, status: availableStatus, departments: availableDepartments, prerequisite_courses: availableCourses});
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: err.message });
  }
}
