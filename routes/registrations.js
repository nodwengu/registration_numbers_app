const express = require('express');
const router = express.Router();

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

const RegistrationNumber = require('../registrationNumber');
const registrationNumber = RegistrationNumber(pool);

router.get('/', async (req, res, next) => {
  
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

router.post('/reg_number/', async (req, res, next) => {
  try {
    let reg_number = (req.body.registration).toUpperCase().trim();
    let isRepeated = await registrationNumber.regIsRepeated(reg_number);
    let validNumber = await registrationNumber.validRegNumber(reg_number);
    let letterNumber = /^[0-9a-zA-Z ]+$/;

    if ( validNumber === false || (!reg_number.match(letterNumber)) ) {
      req.flash('info', 'Please add a valid registration number / Number should not be empty'); 
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

router.get('/reg_number/:reg_number/', async (req, res, next) => {
  try {
    res.render('reg_number', {
      reg_number: req.params.reg_number
    });
  } catch(error) {
    next(error)
  }
});

router.post('/reg_numbers/', async (req, res, next) => {
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

router.get('/reg_numbers/', async (req, res, next) => {
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

router.get('/reg_numbers/delete/:reg_number/', async (req, res, next) => {
  try {
    let reg_number = req.params.reg_number;
    await registrationNumber.deleteById(reg_number);
    req.flash('info', 'Registration number deleted!')
     
    res.redirect('/reg_numbers');
  } catch(error) {
     next(error)
  }
});


module.exports = router;
