import app from './src/app.js';
import pool from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Test DB connection
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', res.rows[0].now);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
});
