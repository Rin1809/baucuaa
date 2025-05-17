// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api'; 


const app = express();

// PORT sẽ được Railway cung cấp qua biến môi trường,
// hoặc mặc định là 3001 nếu chạy local và không có biến PORT nào được đặt.
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors())

app.use(express.json());


app.use('/api', apiRouter);


app.get('/', (req, res) => {
  res.send('Backend server is alive and running!');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);

});