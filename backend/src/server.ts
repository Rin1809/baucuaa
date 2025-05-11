// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api'; // Đường dẫn này phải đúng
// import path from 'path'; // Không cần thiết nếu không serve static file từ đây

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    // console.log(`Data file is expected at: ${path.join(__dirname, 'data.json')}`); // Để debug đường dẫn data.json
});