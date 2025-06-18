## Getting Started with Development

### 1. Clone Repository

Trước tiên, hãy sao chép mã nguồn về máy:

```bash
git clone https://github.com/phuong5514/Arceus-Ex-Sat.git
```

### 2. Cài đặt các thư viện cần thiết

Để chạy được ứng dụng, đảm bảo bạn đã cài đặt [Node](https://nodejs.org/en/download) phiên bản v20.17.0 trở lên. Làm theo hướng dẫn của trang tải về của Node để tiến hành cài đặt.

Để kiểm tra node đã cài thành công:
```bash
node -v
```

Kết quả hiển thị tương tự như sau:
```
v22.16.0
```

Sau đó, bạn cần cài đặt tất cả các thư viện cần cho ứng dụng bằng lệnh:

```bash
npm install
```

### 3. Cài đặt các biến môi trường

Ứng dụng này sử dụng MongoDB cho database. Kết nối đến database được thực hiện thông qua biến môi trường `MONGO_URI`. Để tạo biến môi trường, tạo file `.env` tại thư mục gốc (nếu chưa có) và thêm nhập vào:

```env
MONGO_URI=<your-mongodb-connection-string>
```

### 4. Tạo mock data (Optional)

Nếu cần dữ liệu mẫu để bắt đầu, bạn có thể chạy file seed:

```bash
node seeder.js
```

File này sẽ kết nối đến MongoDB đã cài cài và chèn các bản ghi mẫu (học sinh, môn học, v.v) vào cơ sở dữ liệu.

### 5. Khởi động ứng dung5

Khởi chạy ứng dụng ở chế độ development (sử dụng nodemon):

```bash
npm run dev
```

Nếu bạn không dùng `nodemon`, bạn có thể chạy trực tiếp:

```bash
node app.js
```
