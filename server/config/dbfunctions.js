const oracledb = require('oracledb');
const openConnection = require('./database');

async function executeProcedure(procedure, params, options) {
    let connection;

    try {
        connection = await openConnection();

        const result = await connection.execute(
            `BEGIN ${procedure}; END;`,
            params,
            options
        );

        console.log("Procedure executed successfully!");

        return result;

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function executeFunction(functionName, params, options, ret = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }) {
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

        console.log("Function executed successfully!");

        return result.outBinds.ret;

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function executeProcedureGetArray (procedure, params, options) {
    let connection;

    try {
        connection = await openConnection();

        const result = await connection.execute(
            `BEGIN ${procedure}; END;`,
            params,
            options
        );

        console.log("Procedure executed successfully!");

        let resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows[rows.length]=row;
        }
        await resultSet.close();
        return rows;

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}



module.exports = {
    executeProcedure,
    executeFunction,
    executeProcedureGetArray
};

