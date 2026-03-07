const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
// Serve uploaded images (same folder as multer: src/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(xss());
app.use(hpp());
app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

app.get('/', (req, res) => {
  res.json({
    message: 'Post Management API',
    version: '1.0.0',
    docs: {
      auth: '/api/auth',
      posts: '/api/posts'
    }
  });
});

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;