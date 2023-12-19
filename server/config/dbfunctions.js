const oracledb = require('oracledb');
const openConnection = require('./database.js');
const logger = require('./utils/logger.js');


const executeProcedure = async (procedure, params, options) => {
    let connection;

    try {
        connection = await openConnection();

        const result = await connection.execute(
            `BEGIN ${procedure}; END;`,
            params,
            options
        );

        logger.info("Execution: Procedure Executed Successfully", "dbfunctions.js");

        return result;

    } catch (err) {
        logger.error(`Execution Failed: ${err}`, "dbfunctions.js");

    } finally {
        if (connection) {
            try {
                await connection.commit();
                logger.info("Execution: Procedure Committed Successfully", "dbfunctions.js");

            } catch (err) {
                logger.error(`Error Closing Connection: ${err}`, "dbfunctions.js");
                throw err;

            }
        }
    }
}

const executeFunction = async (functionName, params, options, ret = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }) => {
    let connection;

    try {
        connection = await openConnection();

        const result = await connection.execute(
            `BEGIN :ret := ${functionName}; END;`,
            {
                ret: ret,
                ...params
            },
            options
        );

        logger.info("Execution: Function Executed Successfully", "dbfunctions.js");

        return result.outBinds.ret;

    } catch (err) {
        logger.error(`Execution Failed: ${err}`, "dbfunctions.js");

    } finally {
        if (connection) {
            try {
                await connection.commit();
                logger.info("Execution: Function Committed Successfully", "dbfunctions.js");

            } catch (err) {
                logger.error(`Error Closing Connection: ${err}`, "dbfunctions.js");
                throw err;

            }
        }
    }
}

async function executeProcedureGetArray(procedure, params, options) {
    let connection;

    try {
        connection = await openConnection();

        const result = await connection.execute(
            `BEGIN ${procedure}; END;`,
            params,
            options
        );

        logger.info("Execution: Procedure Executed Successfully, Returning Array");

        let resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        while ((row = await resultSet.getRow())) rows[rows.length] = row;

        await resultSet.close();
        return rows;

    } catch (err) {
        logger.error(`Execution Failed: ${err}`);

    } finally {
        if(connection) {
            try {
                await connection.commit();
                logger.info("Execution: Procedure Committed Successfully", "dbfunctions.js");

            } catch (err) {
                logger.error(`Error Closing Connection: ${err}`, "dbfunctions.js");
                throw err;

            }
        }
    }
}

module.exports = {
    executeProcedure,
    executeFunction,
    executeProcedureGetArray
};