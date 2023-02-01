// Entry-point of our application
const express = require('express')
const cors = require('cors')
const connectToMongo = require('./database'); // import form "database" file
const dotenv = require("dotenv")
const app = express();



dotenv.config({ path: "./config/config.env" })

app.use(express.json())   // if you want to use "req.body" than use this middlevar
app.use(cors())
connectToMongo();
// dotenv.config({ path: "./config/config.env" })

// Available Routs
app.use('/api/auth', require('./routes/auth'))    // link to a new file "routes/auth"
app.use('/api/notes', require('./routes/notes'))


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port http://localhost:${process.env.PORT}`)
});

