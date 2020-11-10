const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mongoose = require('mongoose');

// DB Config
const db = require('../config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Bodyparser
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname + '/../dist')));

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log('listening on *:3000');
});
