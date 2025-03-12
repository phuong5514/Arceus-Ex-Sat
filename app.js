const express = require('express')
const app = express()
const port = 3000

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.render('index', { title: 'Home', message: 'Hello there!' });
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})