# Trang web Quản lý sinh viên (bản cập nhật cho Bài tập 2)
## Cấu trúc source code
```bash
/
├── config 
├── controllers 
├── helpers 
├── logs 
├── models 
├── node_modules
├── public
│   ├── css
│   ├── images
│   └── javascripts
├── routes
├── views
├── app.js
├── seeder.js
```

`app.js` là file chính của chương trình, chứa cấu hình của server và các route xử lý request từ client.

`public` chứa các file css để định kiểu, javascript để cung cấp tương tác và images để chứa các hình ảnh của trang web.

`routes` chứa file xử lý request từ client như GET, POST, PUT, DELETE.

`views` chứa các file html của chương trình. Các file này được viết bằng view engine [EJS](https://ejs.co/).

`seeder.js` thêm dữ liệu mẫu vào database.

`config` chứa các file cài đặt của chương trình.

`controllers` chứa các file xử lý các thao tác của business logic.

`helpers` chứa các file hỗ trợ hoạt động chính của chương trình (thay đổi định dạng dữ liệu, log các xử lý,...).

`logs` chứa các file log ghi chép về các xử lý của chương trình.

`models` chứa các model dữ liệu (bảng) của MongoDB.

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
![image](readme_resources/install_step_1.png)

Thiết lập biến môi trường (có trong file) .env chứa chuỗi kết nối MongoDB:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

Sau đó, thêm dữ liệu mẫu vào database. Bộ dữ liệu mẫu bao gồm dữ liệu 4 sinh viên, căn cước công dân / cmnd và hộ chiếu; 6 khoa; 6 chương trình đào tạo; 6 trạng thái; 12 địa chỉ:

```bash
node seeder.js
```

![image](readme_resources/install_step_2.png)

Cuối cùng, chạy chương trình bằng lệnh:

```bash
npm run dev
```

![image](readme_resources/starting.png)
