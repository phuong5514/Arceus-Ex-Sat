const express = require('express');
const app = express();
const port = 3000;
// import PocketBase from 'pocketbase';


const indexRoute = require('./routes/index_route');

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRoute);


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
});