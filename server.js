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


mongoose.Promise = global.Promise;
mongoose
    .connect('mongodb://gladwinc:gladwinc8249@ds153947.mlab.com:53947/my-todo',
        {useNewUrlParser: true});
         mongoose.connection.once('open', function(){
         console.log('Conection has been made!');
             }).on('error', function(error){
          console.log('Error is: ', error);
        });

app.use(passport.initialize())
require('./config/passport')(passport)

app.use('/api/users', users)

// Static serve not done
// Server static assets if in production
// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('public'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });

    console.log("inside production::")
} else {
    console.log("inside development")

    // Set static folder
    app.use(express.static('public'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });
}

// 


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));

