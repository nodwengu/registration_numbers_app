const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser')
const flash = require('express-flash');
const session = require('express-session');

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

//Define error-handling middleware functions
app.use(function (err, req, res, next) {
   res.status(500);
   res.render('error', { error: err });
})


const { Pool, Client } = require('pg');

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local){
  useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/registrations_db';

const pool = new Pool({
  connectionString,
  ssl : useSSL
});

const RegistrationNumber = require('./registrationNumber');
const registrationNumber = RegistrationNumber(pool);

app.get('/', async (req, res, next) => {
  
  try {
    res.render('index', {
      towns: await registrationNumber.getAllTowns(),
      regNumbersFromTown: await registrationNumber.getAllFromTown(),
      messages: req.flash('info')
    });
  } catch(err) {
    next(err);
  }
})

app.post('/reg_number/', async (req, res, next) => {
  try {
    let reg_number = (req.body.registration).toUpperCase();
    let isRepeated = await registrationNumber.regIsRepeated(reg_number);
    let validNumber = await registrationNumber.validRegNumber(reg_number);
    let letterNumber = /^[0-9a-zA-Z ]+$/;

    if( (!reg_number.match(letterNumber)) || reg_number === "" ) {return}

    if (validNumber === false) {
      req.flash('info', 'Please add a valid registration number'); 
    } else {
      if (!isRepeated) {
        let registration = {
          reg_number: reg_number, 
          town_id: await registrationNumber.getTownId(reg_number)
        }
        await registrationNumber.setRegistration(registration)
        req.flash('info', 'New Record Added');
      } else {
        req.flash('info', 'Record Already Exists');
      }
    }
    res.redirect('/')
  }
  catch(error) {
    next(error)
  }
});

app.get('/reg_number/:reg_number/', async (req, res, next) => {
  try {
    res.render('reg_number', {
      reg_number: req.params.reg_number
    });
  } catch(error) {
    next(error)
  }
});

app.post('/reg_numbers/', async (req, res, next) => {
  try {
    let radioValue = req.body.townRadio;
    if(radioValue) {
      await registrationNumber.setAllFromTown(radioValue);
    } else {
      req.flash('info', 'Please select a town');
    }
    res.redirect('/')

  } catch(error) {
    next(error)
  }
})

app.get('/reg_numbers/', async (req, res, next) => {
  try {
    res.render('reg_numbers', {
      registrations: await registrationNumber.getAllRegistrations(),
      messages: req.flash('info')
    });
  } 
  catch(error) {
    next(error)
  }
})

app.get('/reg_numbers/delete/:reg_number/', async (req, res, next) => {
  try {
    let reg_number = req.params.reg_number;
    await registrationNumber.deleteById(reg_number);
    req.flash('info', 'Registration number deleted!')
     
    res.redirect('/reg_numbers');
  } catch(error) {
     next(error)
  }
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`App started at http://localhost:${PORT}`);
});