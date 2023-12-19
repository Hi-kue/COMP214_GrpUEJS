const oracledb = require('oracledb');
const logger = require('./utils/logger.js');
const DB = require('./database.js');


async function openConnection() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: DB.user,
      password: DB.password,
      connectString: DB.connectString
    });

    logger.info("Connection: Successful Connection to Database");

  } catch (err) {
    logger.error(`Connection Failed: ${err}`)
  }

  return connection;
}

module.exports = openConnection;
