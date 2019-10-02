const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
const flash = require('express-flash');
const session = require('express-session');
const router = require('./routes/registrations.js');

const app = express();

// initialise session middleware - flash-express depends on it
app.use(session({
   secret: "<add a secret string here>",
   resave: false,
   saveUninitialized: true
}));

// initialise the flash middleware
app.use(flash());

//Configure express handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(express.static('public'));

app.use('/', router);
app.use('/reg_numbers/', router);
app.use('/reg_number/:reg_number/', router);
app.use('/reg_numbers/delete/:reg_number/', router);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App started at http://localhost:${PORT}`);
});