const path = require('path');
const express = require('express');
const app = express();
const expressConfig = require('./configure');

// Configures app
expressConfig(app);

// Serve production
app.use(express.static(path.join(__dirname + '/../dist')));

const PORT = process.env.port || 3000;

app.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
