module.exports = function RegistrationNumber(pool) {
   let regNumbersFromTown = [];

   async function setRegistration(registration) {
      let data = [
         registration.reg_number,
         registration.town_id
      ]
      let query = `INSERT INTO registrations(reg_number, town_id) VALUES($1, $2)`;
      return pool.query(query, data);
   }

   async function getAllRegistrations() {
      let query = 'SELECT * FROM registrations';
      let results = await pool.query(query);
      
      return results.rows;
   }

   async function getAllTowns() {
      let query = 'SELECT * FROM towns';
      let results = await pool.query(query);

      return results.rows;
   }

   async function getTownId(registration) {
      let code = registration.slice(0, 2).toUpperCase();
      let query = `SELECT town_id FROM towns WHERE town_code LIKE '${code}'`;
      let results = await pool.query(query);
      
      return results.rows[0].town_id;
   }

   async function getTownIdByName(name){
      let queryResult = `SELECT town_id FROM towns WHERE town_name LIKE '${name}'`;
      let results = await pool.query(queryResult);
      
      return results.rows[0].town_id;
   }

   async function setAllFromTown(theName) {
      if(theName === 'All') {
         regNumbersFromTown = await getAllRegistrations();
      } else {
         let id = await getTownIdByName(theName);
         let queryResult = `SELECT * FROM registrations WHERE town_id = ${id} `;
         let results = await pool.query(queryResult);

         regNumbersFromTown = results.rows;
      }  
   }

   async function getAllFromTown() {
      return regNumbersFromTown;
   }

   async function regIsRepeated(regNumber) {
      let isRepeated = false;
      let registrations = await getAllRegistrations();

      for(let registration of registrations) {
         if(registration.reg_number === regNumber) {
            isRepeated = true;
         }
      }
      return isRepeated;
   }

   async function validRegNumber(number) {
      let code = number.slice(0, 2).toUpperCase();
      let validRegNumber = false;
      let towns = await getAllTowns();

      for(let town of towns) {
         if(town.town_code === code) {
            validRegNumber = true;
         }
      }
      return validRegNumber;
   } 

   async function deleteById(regNumber) {
      return pool.query('DELETE FROM registrations WHERE reg_number = $1', [regNumber]);
   }

   return {
      setRegistration,
      getAllRegistrations,

      getTownId,
      getAllTowns,
      regIsRepeated,
      getTownIdByName,
      setAllFromTown,
      getAllFromTown,
      validRegNumber,
      deleteById,
    

   }
}
