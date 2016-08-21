// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// expose this function to our app using module.exports
module.exports = function(passport, con) {

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
        con.query('SELECT * FROM users WHERE email = ? LIMIT 1', username, function(err, user){
            done(err, user[0]);
        });
    });

    passport.use('local-register', new LocalStrategy({
        passReqToCallback : true
    },
    function(req, username, password, done) {
        console.log(req.body);
        var re = new RegExp("^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$");
        if (re.test(req.body.username)) {
            if (req.body.username === req.body.conUsername) {
                con.query('SELECT * FROM users WHERE email = ?', req.body.username, function(err, rows){
                    if (err) {
                        return done(err);
                    } else {
                        if (rows.length === 0) {
                            if (req.body.password === req.body.conPassword) {
                                var user = {email: req.body.username, password: req.body.password};
                                con.query('INSERT INTO users SET ?', user, function(err, rows){
                                    if (err) {
                                        console.log('err');
                                        return done(err);
                                    } else {
                                        return done(null, user);
                                    }
                                });
                            } else {
                                return done(null, false, 'Passwords not the same');
                            }
                        } else {
                            return done(null, false, 'Email ID already exists');
                        }
                    }
                });
            } else {
                return done(null, false, 'Usernames dont match');
            }
        } else {
            return done(null, false, 'Not a valid email id');
        }
    }));


    passport.use('local-signin', new LocalStrategy({
        passReqToCallback : true 
    },
    function(req, username, password, done) {
        /*if (username === 'hari' && password === 'pass') {
            var user = {username: 'hari', password: 'pass'};
            return done(null, user);
        }
        return done(null, false, {message: 'Wrong username or password'});*/

        con.query('SELECT * FROM users WHERE email = ?', username, function(err, rows){
            if (err) {
                return done(err);
            } else {
                if (rows.length === 0) {
                    return done(null, false, 'Either user does not exist or password entered is incorrect');
                } else if (rows[0].password != password) {
                    return done(null, false, 'Either user does not exist or password entered is incorrect');
                }
                return done(null, rows[0]);
            }
        });
    }));

};