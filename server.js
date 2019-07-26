const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')

const app = express()

//routes
const users = require('./routes/api/users')

// Server static assets if in production
// app.use(express.static(__dirname + 'dist'));



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const db = require('./config/keys').mongoURI

mongoose
    .connect('mongodb://gladwinc:gladwinc8249@ds153947.mlab.com:53947/my-todo')
    .then(() => console.log("Mongodb Connected"))
    .catch(err => console.log("Error: ",err))

app.use(passport.initialize())
require('./config/passport')(passport)

app.use('/api/users', users)

// Static serve not done
// Server static assets if in production
// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/dist'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
    });

    console.log("inside production::")
} else {
    console.log("inside development")

    // Set static folder
    app.use(express.static('client/dist'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
    });
}

// 


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));

