const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const path = require('path');
const connectDB = require('./Database/mongodb');
const ErrorHandler = require('./Middleware/ErrorHandler');

connectDB();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend static files from public/
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/v1/users", require("./Routes/UserRoutes"));
app.use("/api/v1/locations", require("./Routes/LocationRoutes"));
app.use("/api/v1/products", require("./Routes/ProductRoutes"));

// Global error handler (must be at the end, after all other middleware)
app.use(ErrorHandler);

// Root - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});