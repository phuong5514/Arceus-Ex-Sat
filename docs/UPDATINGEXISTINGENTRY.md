# Cập nhật hoặc thêm thuộc tính mới cho một bảng (schema)
## Làm quen với Mongoose

Các schema định nghĩa cấu trúc dữ liệu của từng bảng được khai báo trong thư mục `./models` của repository.

Ứng dụng này sử dụng thư viện [Mongoose](https://mongoosejs.com/docs/schematypes.html) làm ODM (Object-Document Mapper) để ánh xạ các `collection` trong MongoDB thành các đối tượng JavaScript trong source code. Bằng cách này ta có thể sử dụng các phương thức đối tượng để tạo, tìm, cập nhật hoặc xóa dữ liệu.

Dưới đây là một ví dụ file schema `student.js`:

```js
import mongoose, { SchemaTypes } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const StudentSchema = mongoose.Schema({
  _id: String,
  name: String,
  birthdate: Date,
  gender: String,
  class_year: Number,
  program: { type: String, ref: "Program" },
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

Mặc định, mỗi `document` trong bất kỳ `collection` nào của MongoDB đều được có thuộc tính  `_id` với kiểu `ObjectId`, bên cạnh các thuộc tính được định nghĩa trong Schema. Để thuận tiện cho việc debug và test trong ứng dụng này, tất cả các schema đều phải ghi đè thuộc tính `_id` bằng cách định nghĩa lại trường này với kiểu là `String` và nội dung tự quản lý.

Các dòng như `{ type: String, ref: 'Program' }` thể hiện liên kết, nghĩa là `reference`, đến một `collection`
khác. Đây là cách để thiết lập mối quan hệ giữa các bảng. Trong truy vấn, nó giúp liên kết thông tin giữa các bảng với nhau khi cần. Cách làm như vậy gọi là *populate*. Ví dụ, trong schema của `Student` phía trên, thông tin về `identity-card` được liên kết đến bảng của schema `indentity-card` để xem thêm các thông tin như ngày cấp, nơi cấp, v.v.

Sau phần định nghĩa schema, bạn sẽ thấy hai plugin được gắn vào schema này. Đây là hai plugin giúp hỗ trợ chia trang, hay là *pagination*, cho kết quả truy vấn:

+ `mongoose-paginate-v2`: hỗ trợ phân trang đơn giản.
+ `mongoose-aggregate-paginate-v2`: hỗ trợ phân trang khi truy vấn nâng cao với aggregate pipeline.

Ở dòng cuối cùng, mongoose sẽ dùng Schema để tạo ra lớp Model của đối tượng. Tại đây ta nhập vào schema, tên schema, và tên của `collection` mà ta muốn tạo trong MongoDB. Mỗi khi một `document` của một `collection` mới được tạo, Mongoose sẽ tạo cả `collection` và `document`

## Thêm thuộc tính

Để thêm thuộc tính vào một schema, thêm một key mới vào Schema của Mongoose dưới dạng:

`<thuộc tính mới> :  <kiểu dữ liệu>`

Hoặc 

`<thuộc tính mới> : { type: <kiểu dữ liệu> }`

Bạn có thể tra cứu thêm các kiểu dữ liệu hỗ trợ tại [trang chính thức của Mongoose](https://mongoosejs.com/docs/schematypes.html).

Dưới đây là một ví dụ:
```js
const StudentSchema = mongoose.Schema({
  _id: String,
  ... // Các trường khác
  hobby: String,
});
```

Các schema của Mongoose chỉ dụng để mô hình hóa các `collection` và dễ dàng cập nhật database. Schema của Mongoose sẽ cấu hình bắt lỗi về việc cập nhật các giá trị với kiểu phù hợp, nhưng bất kỳ nội dung cũ nào của `collection` trong MongoDB sẽ không được cập nhật. Do vậy, để cập nhật toàn bộ `collection` để theo một schema mới, ta cần viết lệnh để cập nhật các `document` cũ.

Trong VSCode, sử dụng extentions `MongoDB for VSCode` và MongoDB URI để kết nối tới databse bằng connection string. Sau đó, tại database, bảng bạn muốn cập nhật, nhấp và chọn vào biểu tượng MongoDB Playground. MongoDB Playground cung cấp môi trường để làm việc trực tiếp với database thông qua Javascript. Các câu lệnh sử dụng MongoDB API, và có nét giống với Moongose API. Ví dụ, để cập nhật các `document` cũ sao cho thuộc tính mới `hobby` được gắn vào và giá trị mặc định là chuỗi rỗng, paste vào nội dung sau và nhấp vào Run:

```js
use("<tên database>");

db.students.updateMany(
  { hobby: { $exists: false } },
  { $set: { hobby: "" } }
)
```

Xem thêm về [MongoDB API](https://www.mongodb.com/docs/manual/reference/method/js-collection/)

## Thêm, cập nhật, và xóa document

Sau khi định nghĩa Schema và tạo Model với Mongoose, bạn có thể dễ dàng thao tác với MongoDB bằng các phương thức tương ứng trên Model. Các thao tác cơ bản bao gồm:

- `insertOne` / `create`: thêm một document
- `insertMany`: thêm nhiều document
- `updateOne` / `update`: cập nhật một document
- `updateMany`: cập nhật nhiều document
- `deleteOne` / `delete`: xóa một document
- `deleteMany`: xóa nhiều document

Các phương thức này đều là bất đồng bộ và thường được sử dụng kèm `async/await`.

Xem chi tiết tại [Mongoose Model API](https://mongoosejs.com/docs/api/model.html).

Dưới đây là một ví dụ thêm, cập nhật và xóa document với model `Student`:

```js
import Student from '../models/student.js';

// Thêm một sinh viên mới
await Student.create({
  _id: "SV001",
  name: "Nguyễn Văn A",
  birthdate: new Date("2001-08-15"),
  gender: "Nam",
  class_year: 2020,
  email: "vana@example.com",
  nationality: "Vietnam",
});

// Cập nhật số điện thoại của sinh viên đã có
await Student.updateOne(
  { _id: "SV001" },
  { $set: { phone_number: "0901234567" } }
);

// Xóa sinh viên với mã số SV001
await Student.deleteOne({ _id: "SV001" });

```

## Ghi chú về `lean()` trong Mongoose

Khi truy vấn bằng Mongoose, mặc định kết quả trả về là một đối tượng document — tức là một bản ánh xạ đầy đủ từ schema, không chỉ chứa dữ liệu mà còn có các phương thức như `.save()`, `.populate()` và các xử lý khác. Đây là một điểm mạnh của Mongoose vì bạn có thể thao tác trực tiếp lên đối tượng đó để cập nhật, validate, hoặc lưu lại mà không cần gọi thêm gì cả.

Ví dụ:

```js
const student = await Student.findOne({ _id: "SV001" });
student.phone_number = "0901234567";
await student.save(); // lưu trực tiếp document đã sửa
````

Lúc này, `student` là một document có đầy đủ reference đến collection gốc. Việc chỉnh sửa nó tương đương với chỉnh sửa trực tiếp trên database, miễn là gọi `.save()` sau cùng. Điều này rất tiện, nhưng cũng tiềm ẩn nhiều rủi ro nếu dùng không cẩn thận:

+ Nếu không chủ đích cập nhật mà vẫn thao tác trên document dạng reference, dễ gây lỗi không mong muốn.
+ Object trả về chứa nhiều hàm và metadata nội bộ, không phù hợp khi chỉ cần dữ liệu thuần để render hoặc trả ra API.
+ Hiệu năng có thể giảm, nhất là với các truy vấn trả về số lượng lớn document.

Để tránh các vấn đề trên, Mongoose cung cấp `.lean()`. Khi gọi thêm `.lean()`, kết quả trả về sẽ là một plain JavaScript object, chỉ gồm dữ liệu, không có thêm hàm `.save()` hay `.populate()` gì cả:

```js
const student = await Student.findOne({ _id: "SV001" }).lean();
console.log(student.phone_number); // chỉ là dữ liệu
```

Cách này giúp tăng hiệu năng rõ rệt vì Mongoose không phải tạo ra lớp đối tượng đầy đủ từ schema. Đây là lựa chọn nên dùng khi:

+ Truy vấn chỉ để đọc, không cần sửa đổi
+ Cần trả kết quả ra API dưới dạng JSON
+ Truy vấn với số lượng lớn document

Ngược lại, nếu cần thao tác sau khi truy vấn — như sửa đổi rồi `.save()`, hoặc `.populate()` để lấy thêm dữ liệu liên kết — thì không nên dùng `lean()`.

