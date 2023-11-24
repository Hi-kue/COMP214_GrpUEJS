const oracledb = require('oracledb');
let DB = require('./db');

async function openConnection() {
  let connection;

  try {
    connection = await oracledb.getConnection({
    user: DB.user,
    password: DB.password,
    connectString: DB.connectString
    });

    console.log('Successfully connected to Oracle!');
  } catch (err) {
    console.error(err);
  }

  return connection;
}

module.exports = openConnection;
