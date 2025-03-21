# Trang web Quản lý sinh viên (bản cập nhật cho Bài tập 2)
## Cấu trúc source code
```bash
/
├── nodemodules
├── pb_migrations
├── public
│   ├── css
│   ├── images
│   └── javascripts
├── routes
├── views
├── app.js
├── seeder.js
├── superuser.js
└── pocketbase.exe
```

`app.js` là file chính của chương trình, chứa cấu hình của server và các route xử lý request từ client.

`public` chứa các file css để định kiểu, javascript để cung cấp tương tác và images để chứa các hình ảnh của trang web.

`routes` chứa file xử lý request từ clientm như GET, POST, PUT, DELETE.

`views` chứa các file html của chương trình. Các file này được viết bằng view engine [EJS](https://ejs.co/).

`pb_migrations` chứa các file migration của database, cần thiết để dựng các lược đồ quan hệ trong database.

`superuser.js` cấp quyền truy cập database cho người dùng với vai trò là superuser client để thực hiện các thao tác CRUD.  

`seeder.js` thêm dữ liệu mẫu vào database.

## Hướng dẫn cài đặt & chạy chương trình
### Yêu cầu

[Node.js](https://nodejs.org/en/download/) phiên bản từ v20.17.0 trở lên.

Bài tập sử dụng MongoDB, một hệ quản trị cơ sở dữ liệu NoSQL mạnh mẽ và linh hoạt.

Chúng ta có thể tải MongoDB Atlas để trực tiếp nhìn thấy các record dữ liệu của trang web Quản lý học sinh.

### Cài đặt & chạy chương trình

Tiến hành cài đặt các module cần thiết bằng lệnh:  

```bash
npm install
```
Thiết lập biến môi trường (có trong file) .env chứa chuỗi kết nối MongoDB:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

Sau đó, thêm dữ liệu mẫu vào database. Bộ dữ liệu mẫu bao gồm dữ liệu 21 sinh viên:

```bash
node seeder.js
```

Cuối cùng, chạy chương trình bằng lệnh:

```bash
npm run dev
```
