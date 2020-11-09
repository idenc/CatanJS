const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);

app.use(express.static(path.join(__dirname + '/../dist')));

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log('listening on *:3000');
});
