// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api'; // Đảm bảo đường dẫn này đúng đến file api.ts của bạn
// import path from 'path'; // Bỏ comment nếu bạn cần path cho việc khác, hiện tại không cần

const app = express();

// PORT sẽ được Railway cung cấp qua biến môi trường,
// hoặc mặc định là 3001 nếu chạy local và không có biến PORT nào được đặt.
const PORT = process.env.PORT || 3001;

// Middleware
// Cho phép Cross-Origin Resource Sharing (CORS)
// Trong production, bạn nên cấu hình chặt chẽ hơn cho origin cụ thể của frontend
// Ví dụ:
// const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Thay 5173 bằng port frontend của bạn
// app.use(cors({ origin: frontendUrl }));
app.use(cors()); // Cho phép tất cả các origin cho mục đích demo/bắt đầu

// Middleware để parse JSON request bodies
app.use(express.json());

// Routes
// Tất cả các route bắt đầu bằng /api sẽ được xử lý bởi apiRouter
app.use('/api', apiRouter);

// Một route cơ bản để kiểm tra server (tùy chọn)
app.get('/', (req, res) => {
  res.send('Backend server is alive and running!');
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  // Dòng debug này hữu ích khi chạy local để biết data.json ở đâu,
  // nhưng khi deploy, __dirname sẽ trỏ đến thư mục build (dist)
  // console.log(`Data file is expected at: ${path.join(__dirname, 'data.json')}`);
});