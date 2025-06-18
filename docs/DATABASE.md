# Database Schema

Trang này sẽ đề cập đến toàn bộ database schema được cài đặt và sử dụng trong ứng dụng.\
Cơ sở dữ liệu của ứng dụng là mongodb\
Shema được chia thành các model như sau:
1. [Class](#class)
3. [Course](#course)
4. [Department](#department)
5. [Enrollment](#enrollment)
6. [Student](#student)
    - [Address](#address)
    - [Status](#status)
    - [Program](#program)
    - [Major](#major)
    - [Identity card](#identity-card)
    - [Passport](#passport)  
7. [Transcript](#transcript)

[Naming convention](#naming-convention) của cơ sở dữ liệu



# Class

    _id: { type:  String, required:  true },
    course_id: { type:  String, ref:  "Course", required:  true },
    academic_year: { type:  String, required:  true }, 
    semester: { type:  String, required:  true },
    lecturer: { type:  String },
    max_students: { type:  Number, required:  true },
    schedule: { type:  String },
    classroom: { type:  String },
    created_at: { type:  Date, default:  Date.now }

Giảng viên (lecturer), schedule, classroom hiện tại không phải là 1 model trong schema cơ sở dữ liệu, nên được lưu trữ dưới dạng String\
course_id cần phải là giá trị _id tồn tại trong bảng "Course"

# Course

    _id: { type:  String, required:  true },
    course_name: { type:  String, required:  true },
    credits: { type:  Number, required:  true, min:  2 },
    department: { type:  String, required:  true },
    description: { type:  String },
    prerequisite_course: { type:  String, ref:  "Course", default:  null },
    is_active: { type:  Boolean, default:  true },
    created_at: { type:  Date, default:  Date.now },

prerequisite_course là giá trị _id tồn tại trong bảng course, trường dữ liệu này nên có tên prerequistie_course_id, nhưng được đặt như thế do chưa có naming convention cụ thể cho id được reference trong giai đoạn viết bảng này

# Department

    _id: { type:  String, required:  true },
    department_name: { type:  String, required:  true },
    description: { type:  String },

# Enrollment

    _id: { type:  String, required:  true },
    student_id: { type:  String, ref:  "Student", required:  true },
    class_id: { type:  String, ref:  "Class", required:  true },
    enrolled_at: { type:  Date, default:  Date.now },
    canceled: { type:  Boolean, default:  false },
    canceled_reason: { type:  String, default:  null },
    canceled_at: { type:  Date, default:  null }

student_id cần phải là giá trị _id tồn tại trong bảng "Student"\
class_id cần phải là giá trị _id tồn tại trong bảng "Class"

# Student

    _id:  String,
    name:  String,
    birthdate:  Date,
    gender:  String,
    class_year:  Number,
    program: { type:  String, ref:  "Program" },
    address:  String,
    email:  String,
    phone_number:  String,
    status: { type:  String, ref:  "Status" },
    major: { type:  String, ref:  "Major" },
    permanent_address: {type:  String, ref:  "Address"},
    temporary_address: {type:  String, ref:  "Address"},
    mailing_address: {type:  String, ref:  "Address"},
    nationality:  String,
    identity_card: {type:  String, ref:  "IdentityCard"},
    passport: {type:  String, ref:  "Passport"},

major cần phải là giá trị _id tồn tại trong bảng "Major"\
status cần phải là giá trị _id tồn tại trong bảng "Status"\
permanent_address, temporary_address, và mailing_address cần phải là giá trị _id tồn tại trong bảng "Address"\
identity_card cần phải là giá trị _id tồn tại trong bảng "IdentityCard"\
passport cần phải là giá trị _id tồn tại trong bảng "P


## Address

    _id:  String,
    house_number:  String,
    street:  String,
    ward:  String, 
    district:  String,
    city:  String,
    country:  String,
    postal_code:  String

## Status
    
    _id :  String,
    status_name :  String

## Program

    _id :  String,
    program_name :  String

## Major
    
    _id :  String,
    major_name :  String

## Identity card

    _id:  String,
    issue_date:  Date,
    expiry_date:  Date,
    issue_location:  String,
    is_digitized:  Boolean,
    chip_attached:  Boolean,

Trường dữ liệu chip_attached không theo naming convention

## Passport
    
    _id:  String,
    type:  String,
    country_code:  String,
    issue_date:  Date,
    expiry_date:  Date,
    issue_location:  String,
    notes: { type:  String }

# Transcript

    _id: { type:  String, required:  true },
    student_id: { type:  String, ref:  "Student", required:  true },
    class_id: { type:  String, ref:  "Class", required:  true },
    grade: { type:  Number, min:  0, max:  10, required:  true },
    recorded_at: { type:  Date, default:  Date.now }


# Naming convention
***Tên model***: viết bằng PascalCase\
Ví dụ:
> IdentityCard
> Class
> Department

***Tên schema***: viết bằng PascalCase, đặt tên theo <TênModel>Schema\
Ví dụ:
> AddressSchema
> ClassSchema
> DepartmentSchema

***Tên collection***: viết bằng snake_case, trùng từ ngữ với tên model, sử dụng dạng số nhiều\
Ví dụ:
> identity_cards
> classes
> passports

***Tên các trường dữ liệu***:\
**khóa chính**: luôn luôn là "_id", kiểu dữ liệu là String\
**các khóa còn lại**: viết bằng snake_case
- *Với các trường dữ liệu có loại dữ liệu khác Boolean và Date / thời gian*: sử dụng từ ngữ danh từ
- *Với các trường dữ liệu có loại dữ liệu Boolean*: viết dưới dạng câu hỏi "is_<tính từ>"
- *Với các trường dữ liệu có loại dữ liệu Date / thời gian*: viết dưới dạng "<động từ>_at", "<danh từ>_date", hay danh từ có ý nghĩa về thời gian


