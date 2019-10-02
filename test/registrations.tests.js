
const assert = require('assert');
const RegistrationNumber = require('../registrationNumber');

const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/registrations_tests';

const pool = new Pool({
  connectionString
});

describe('The Registrations numbers database web app', function () {

  beforeEach(async function () {
    pool.query("DELETE FROM registrations;");
  });

  it('should be able to add a registrations to the table', async function(){
      const registrationNumber = RegistrationNumber(pool);

      let regObj = {
        reg_number: 'CA 123', 
        town_id: await registrationNumber.getTownId('CA 123')
      }
      await registrationNumber.setRegistration(regObj);
      let registrations = await registrationNumber.getAllRegistrations();
      assert.equal(1, registrations.length);
  });

  it('should be able return a towns id', async function(){
    const registrationNumber = RegistrationNumber(pool);

    assert.equal('1', await registrationNumber.getTownId('CA 123'));
    assert.equal('4', await registrationNumber.getTownId('CL 123'));
    assert.equal('2', await registrationNumber.getTownId('CY 123'));
    assert.equal('3', await registrationNumber.getTownId('CJ 123'));
  });

  it('should be able to check if registration number is already stored in the table', async function(){
    const registrationNumber = RegistrationNumber(pool);

    let regObj = {
      reg_number: 'CA 123', 
      town_id: await registrationNumber.getTownId('CA 123')
    }
    await registrationNumber.setRegistration(regObj);

    assert.equal(true, await registrationNumber.regIsRepeated('CA 123'));
    assert.equal(false, await registrationNumber.regIsRepeated('CJ 123'));
  });

  it('should be able to return towns', async function(){
    const registrationNumber = RegistrationNumber(pool);

    let results = [
      { town_id: 1, town_name: 'Cape Town', town_code: 'CA' },
      { town_id: 2, town_name: 'Bellville', town_code: 'CY' },
      { town_id: 3, town_name: 'Paarl', town_code: 'CJ' },
      { town_id: 4, town_name: 'Stellenbosch', town_code: 'CL' } ]

    assert.deepEqual(results, await registrationNumber.getAllTowns());
  });

  it('should be able to return id for a specific town', async function(){
    const registrationNumber = RegistrationNumber(pool);

    assert.equal(1, await registrationNumber.getTownIdByName('Cape Town'));
    assert.equal(2, await registrationNumber.getTownIdByName('Bellville'));
    assert.equal(3, await registrationNumber.getTownIdByName('Paarl'));
    assert.equal(4, await registrationNumber.getTownIdByName('Stellenbosch'));
  });

  it('should be able to return all registrations for a specific town.', async function(){
    const registrationNumber = RegistrationNumber(pool);

    let regObj1 = { reg_number: 'CA 123', town_id: await registrationNumber.getTownId('CA 123') }
    await registrationNumber.setRegistration(regObj1);

    let regObj2 = { reg_number: 'CA 112', town_id: await registrationNumber.getTownId('CA 112') }
    await registrationNumber.setRegistration(regObj2);

    let regObj3 = {reg_number: 'CL 123', town_id: await registrationNumber.getTownId('CL 123')}
    await registrationNumber.setRegistration(regObj3);

    let allFromCapeTown = await registrationNumber.getAllFromTown('Cape Town')
    let allFromBellville = await registrationNumber.getAllFromTown('Bellville')
    let allFromPaarl = await registrationNumber.getAllFromTown('Paarl')
    let allFromStellenbosch = await registrationNumber.getAllFromTown('Stellenbosch') 

    assert.deepEqual(allFromCapeTown, await registrationNumber.getAllFromTown('Cape Town'));
    assert.deepEqual(allFromBellville, await registrationNumber.getAllFromTown('Bellville'));
    assert.deepEqual(allFromPaarl, await registrationNumber.getAllFromTown('Paarl'));
    assert.deepEqual(allFromStellenbosch, await registrationNumber.getAllFromTown('Stellenbosch'));

  });

  it('should be able to return true if registration number is provided', async function(){
    const registrationNumber = RegistrationNumber(pool);

    assert.equal(false, await registrationNumber.validRegNumber('CB 122'));
    assert.equal(true, await registrationNumber.validRegNumber('CL 122'));
  });
  
  after(function(){
    pool.end();
  })
});