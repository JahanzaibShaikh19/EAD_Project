export default function errorHandler(err, req, res, next) {
  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Record already exists.' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced record not found.' });
  }

  const status = err.status || 500;
  const message = err.message || 'Something went wrong. Please try again later.';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
    return res.status(status).json({ success: false, message, error: err.stack });
  }

  res.status(status).json({ success: false, message });
}
