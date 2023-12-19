const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const openConnection = require('../config/database');
const db = require('../config/dbfunctions');

/**
 * ROUTE :: /home
 * Renders the home ejs page.
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
router.get('/home', (req, res) => {
  res.render('home', { pageName: 'Home' });
});

/**
 * ROUTE :: /
 * Renders the home ejs page.
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
router.get('/', (req, res) => {
  res.render('home', { pageName: 'Home' });
});


/**
 * ROUTE :: /staff-main-menu
 * Renders the staff_main_menu ejs page.
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
router.get('/staff-main-menu', (req, res) => {
  res.render('./menus/staff_main_menu', { pageName: 'Staff Main Menu' });
});

/**
 * ROUTE :: /client-main-menu
 * Renders the client_main_menu ejs page.
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
router.get('/branch-main-menu', (req, res) => {
  res.render('./menus/branch_main_menu', { pageName: 'Branch Main Menu' });
});

/**
 * ROUTE :: /client-main-menu
 * Renders the client_main_menu ejs page.
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
router.get('/client-main-menu', (req, res) => {
  res.render('./menus/client_main_menu', { pageName: 'Client Main Menu' });
});

/**
 * ROUTE :: /hire-staff
 * Renders the staff_hire ejs page.
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
router.get('/hire-staff', async (req, res) => {
  const staff = req.query.staff;

  let brancho_list = await db.executeProcedureGetArray(`get_branch_address_list(:cursor)`,
    { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } },
    {});

  res.render('./menus/staff_main_menu/hire_staff', { staffno: generateUniqueId('S_'), brancho_list: brancho_list, staff:staff });
});

/**
 * ROUTE :: /hire-staff
 * Renders the staff_hire ejs page and calls the staff_hire_sp procedure.
 * @param {Object} req - request object.
 * @param {Object} res - response object.
 */
router.post('/hire-staff', (req, res) => {
  db.executeProcedure('Staff_hire_sp(:staffno, :fname, :lname, :position, :sex, :dob, :salary, :branchno, :telephone, :mobile, :email)',
    {
      staffno: req.body.staffno,
      fname: req.body.fname,
      lname: req.body.lname,
      position: req.body.position,
      sex: req.body.sex,
      dob: moment(req.body.dob, 'YYYY-MM-DD').format('DD-MMM-YY'),
      salary: Number(req.body.salary),
      branchno: req.body.branchno,
      telephone: req.body.telephone,
      mobile: req.body.mobile,
      email: req.body.email
    },
    { autoCommit: true });

    res.redirect(`/hire-staff?staff=${req.body.fname} ${req.body.lname}. position: ${req.body.position}. gender: ${req.body.sex}. dob: ${req.body.dob}. salary: ${req.body.salary}. branch: ${req.body.branchno}. tel: ${req.body.telephone}. mobile: ${req.body.mobile}. email: ${req.body.email}`);
});

// --------------------- edit staff ---------------------
router.get('/staff-editor', async (req, res) => {
  const staffno = req.query.staffno;
  let connection;

  try {
    connection = await openConnection();

    const result = await connection.execute(
      `BEGIN get_staff_list(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const resultSet = result.outBinds.cursor;
    let row;
    const staff_list = [];

    while ((row = await resultSet.getRow())) {
      staff_list.push(row);

    }

    await resultSet.close();
    res.render('./menus/staff_main_menu/staff_editor', { staff_list: staff_list, staffno: staffno });

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
});

router.post('/save-staff-edits', async function (req, res) {
  const sql = `
          UPDATE dh_staff
          SET salary = :salary,
              mobile = :mobile,
              telephone = :telephone,
              email = :email
          WHERE staffno = :staffno
      `;

  const binds = {
    salary: req.body.salary,
    mobile: req.body.mobile,
    telephone: req.body.telephone,
    email: req.body.email,
    staffno: req.body.staffno
  };

  const options = {
    autoCommit: true
  };

  const result = await db.executeProcedure(sql, binds, options);
  res.redirect('/staff-editor?staffno=' + req.body.staffno);
});

// --------------------- add client ---------------------
router.get('/add-client', (req, res) => {
  let client = req.query.client;
  res.render('./menus/client_main_menu/add_client', { clientno: generateUniqueId('C_'),client:client });
});
router.post('/add-client', (req, res) => {
  // Call the client_add_sp procedure with the form data
  db.executeProcedure('client_add_sp(:clientno,:fname, :lname, :telno, :street, :city, :email, :preftype, :maxrent)',
    {
      clientno: req.body.clientno,
      fname: req.body.fname,
      lname: req.body.lname,
      telno: req.body.telno,
      street: req.body.street,
      city: req.body.city,
      email: req.body.email,
      preftype: req.body.preftype,
      maxrent: Number(req.body.maxrent)
    },
    { autoCommit: true });
  // Redirect the user back to the form
  res.redirect('/add-client?client='+req.body.fname+' '+req.body.lname+' tel: '+ req.body.telno+'. address: '+ req.body.street+'. '+ req.body.city+' email: '+req.body.email+'. preftype: '+req.body.preftype+' maxrent: '+req.body.maxrent+'.');
});

// --------------------- edit client ---------------------
router.get('/client-editor', async (req, res) => {
  let clientno = req.query.clientno;
  let connection;

  try {
    connection = await openConnection();
    const result = await connection.execute(
      `BEGIN get_client_list(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const resultSet = result.outBinds.cursor;
    let row;
    const client_list = [];

    while ((row = await resultSet.getRow())) {
      client_list.push(row);
    }

    await resultSet.close();
    res.render('./menus/client_main_menu/client_editor', { client_list: client_list, clientno: clientno });
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
});

router.post('/save-client-edits', async function (req, res) {
  const sql = `
          UPDATE dh_client
          SET telno = :telno,
              street = :street,
              city = :city,
              email = :email,
              preftype = :preftype,
              maxrent = :maxrent
          WHERE clientno = :clientno
      `;

  const binds = {
    clientno: req.body.clientno,
    telno: req.body.telno,
    street: req.body.street,
    city: req.body.city,
    email: req.body.email,
    preftype: req.body.preftype,
    maxrent: Number(req.body.maxrent)
  };

  const options = {
    autoCommit: true
  };

  const result = await db.executeProcedure(sql, binds, options);
  res.redirect('/client-editor?clientno=' + req.body.clientno);
});

// --------------------- edit branch ---------------------
router.get('/branch-editor', async (req, res) => {
  let branchno = req.query.branchno;
  let connection;

  try {
    connection = await openConnection();
    const result = await connection.execute(
      `BEGIN get_branch_list(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const resultSet = result.outBinds.cursor;
    let row;
    const branch_list = [];

    while ((row = await resultSet.getRow())) {
      branch_list.push(row);
    }

    await resultSet.close();
    res.render('./menus/branch_main_menu/branch_editor', { branch_list: branch_list, branchno: branchno });
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
});

router.post('/save-branch-edits', async function (req, res) {
  const sql = `
          UPDATE dh_branch
          SET street = :street,
              city = :city,
              postcode = :postcode
          WHERE branchno = :branchno
      `;

  const binds = {
    branchno: req.body.branchno,
    street: req.body.street,
    city: req.body.city,
    postcode: req.body.postcode,
  };

  const options = {
    autoCommit: true
  };

  const result = await db.executeProcedure(sql, binds, options);
  res.redirect('/branch-editor?branchno=' + req.body.branchno);
});
// --------------------- find branch ---------------------

router.get('/find-branch', async (req, res) => {
  let branchno = req.query.branchno;
  if (branchno) {
    (async () => {
      let branch_list = await db.executeProcedureGetArray(
        `get_branch_record(:P_BRANCHNO, :cursor)`,
        {
          P_BRANCHNO: branchno,
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        },
        {}
      );
      if (branch_list[0]) {
        res.render('./menus/branch_main_menu/branch_finder', { branch: branch_list[0] });
      } else {
        res.render('./menus/branch_main_menu/branch_finder', { branch: branchno });
      }

    })();
  } else {
    res.render('./menus/branch_main_menu/branch_finder', { branch: '' });
  }
});

router.post('/find-branch', async (req, res) => {
  res.redirect('/find-branch?branchno=' + req.body.branchno)
})


module.exports = router;