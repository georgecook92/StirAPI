//starting point for app
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');
const cors = require('cors');

//db setup
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:auth/auth';
mongoose.connect(dbUrl);

//app setup - middleware
//logging framework
app.use(morgan('combined'));

//cors cover
app.use( cors() );

//parses incoming requests - into JSON
app.use(bodyParser.json({ type: '*/*' }));

router(app);

//server setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('server listening on:', port);
