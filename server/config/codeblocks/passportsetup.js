const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const openConnection = require('../database');
const oracledb = require('oracledb');

passport.use(new LocalStrategy(
    async function (username, password, done) {
      let connection;
  
      try {
        connection = await openConnection();
  
        const result = await connection.execute(
          `SELECT * FROM prj_user WHERE username = :username`,
          [username]
        );
        
        if (result.rows.length > 0) {
          const user = {};
          user.username = result.rows[0][0];
          user.password = result.rows[0][1];
          
          if (password === user.password) { // replace with hashed password comparison
            return done(null, user, {message:''});
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        } else {
          return done(null, false, { message: 'Incorrect username.' });
        }
      } catch (err) {
        return done(err);
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
  ));
  
  passport.serializeUser(function (user, done) {
    done(null, user.username);
  });
  
  passport.deserializeUser(async function (username, done) {
    let connection;
  
    try {
      connection = await openConnection();
  
      const result = await connection.execute(
        `SELECT * FROM prj_user WHERE username = :username`,
        [username]
      );
  
      if (result.rows.length > 0) {
        const user = {}
        user.username = result.rows[0][0];
        user.password = result.rows[0][1];
  
        done(null, user);
      } else {
        done(new Error('User not found.'));
      }
    } catch (err) {
      done(err);
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