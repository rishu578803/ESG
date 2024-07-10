const express = require('express');
const cors = require('cors');
const scrapeRoutes = require('./routes/scrape');

const app = express();
const allowedOrigins = ["http://13.201.128.161", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  })
);


app.use((err, req, res, next) => {
    if (err instanceof Error && err.message === 'Not allowed by CORS') {
        res.status(403).send('CORS error: You are not allowed to access this resource.');
    } else {
        next(err);
    }
});

app.use('/api',scrapeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
