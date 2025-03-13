# Trang web Quản lý sinh viên 
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

Bài tập sử dụng [PocketBase](https://pocketbase.io/), một công cụ backend nhẹ và nhanh chóng để tạo và quản lý một SQLite database.  

Trên hệ điều hành Linux hoặc MacOs, xóa file pockbase.exe, sau đó tải và giải nén file `.zip` tương thích từ [trang hướng dẫn của PocketBase](https://pocketbase.io/docs) tại thư mục gốc của project. Nếu hệ điều hành là Windows thì không cần thực hiện bước này.

### Cài đặt & chạy chương trình

Tiến hành cài đặt các module cần thiết bằng lệnh:  

```bash
npm install
```

Trước khi chạy chương trình, tiến hành dựng PocketBase database bằng lệnh:
  
```bash
./pocketbase serve
```

Sau đó, thêm dữ liệu mẫu vào database. Bộ dữ liệu mẫu bao gồm dữ liệu 21 sinh viên:

```bash
node seeder.js
```

Cuối cùng, chạy chương trình bằng lệnh:

```bash
npm run dev
```
