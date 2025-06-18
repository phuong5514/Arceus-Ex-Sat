## Cập nhật hoặc thêm thuộc tính mới cho một bảng (schema)
### Định nghĩa Schema

Các schema định nghĩa cấu trúc dữ liệu của từng bảng được khai báo trong thư mục `./models`.

Ứng dụng sử dụng thư viện [Mongoose](https://mongoosejs.com/docs/schematypes.html) làm ODM (Object-Document Mapper) để ánh xạ các bảng (`collection`) trong MongoDB thành các đối tượng JavaScript trong source code. Bằng cách này ta có thể sử dụng các phương thức đối tượng để tạo, tìm, cập nhật hoặc xóa dữ liệu.

Dưới đây là một ví dụ file schema `student.js`:

```js
import mongoose, { SchemaTypes } from "mongoose";
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const StudentSchema = mongoose.Schema({
  _id: String,
  name: String,
  birthdate: Date,
  gender: String,
  class_year: Number,
  program: { type: String, ref: "Program" },
  address: String,
  email: String,
  phone_number: String,
  status: { type: String, ref: "Status" },
  major: { type: String, ref: "Major" },
  permanent_address: { type: String, ref: "Address" },
  temporary_address: { type: String, ref: "Address" },
  mailing_address: { type: String, ref: "Address" },
  nationality: String,
  identity_card: { type: String, ref: "IdentityCard" }, 
  passport: { type: String, ref: "Passport" }, 
});

StudentSchema.plugin(paginate);
StudentSchema.plugin(aggregatePaginate);

const Student = mongoose.model("Student", StudentSchema, "students");
export default Student;
```

Mặc định, mỗi `document` trong `collection` của MongoDB đều được cấp thuộc tính  `_id` với kiểu `ObjectId` cùng với các thuộc tính được định nghĩa trong Schema. Để thuận tiện cho việc debug và test trong ứng dụng này, **tất cả các schema đều được ghi đè thuộc tính `_id`** bằng cách định nghĩa lại trường `_id` với kiểu là `String`.

Các dòng như `{ type: String, ref: "Program" }` thể hiện **liên kết (reference)** đến một bảng 
khác. Đây là cách để thiết lập mối quan hệ giữa các bảng. Trong truy vấn, nó giúp liên kết thông tin giữa các bảng với nhau (*populate*) khi cần. Ví dụ, trong ví schema của `Student` phí trên, thông tin về `identity-card` được liên kết đến bảng của schema `Indentity Cards` để xem thêm các thông tin như ngày cấp, nơi cấp, v.v

Sau phần định nghĩa schema, bạn sẽ thấy hai plugin được gắn vào schema này. Đây là hai plugin giúp hỗ trợ chia trang (*pagination*) cho kết quả truy vấn:

+ `mongoose-paginate-v2`: hỗ trợ phân trang đơn giản.
+ `mongoose-aggregate-paginate-v2`: hỗ trợ phân trang khi truy vấn nâng cao với aggregate pipeline.

Cuối cùng, mongoose sẽ dùng Schema để tạo ra lớp Model của đối tượng:

```js
const Student = mongoose.model("Student", StudentSchema, "students");
```

`"students"` là tên collection trong MongoDB. Nếu chưa tồn tại, Mongo sẽ tự tạo khi có dữ liệu đầu tiên được ghi vào.

Bạn có thể tra cứu thêm các kiểu dữ liệu hỗ trợ tại trang chính thức của Mongoose: [https://mongoosejs.com/docs/schematypes.html](https://mongoosejs.com/docs/schematypes.html)

