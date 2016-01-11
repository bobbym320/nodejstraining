let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')
let util = require('util')

module.exports = (app) => {
  let passport = app.passport
  console.log('In passport module')
  passport.use(new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'username',
    failureFlash: true
  }, nodeifyit(async (username, password) => {
    let user
    console.log('In passport module - ' + username + ' : '+ password)
    if(username.indexOf('@')){
      let email = username.toLowerCase()
      user = await User.promise.findOne({email})
      console.log('In passport module - user == ' +user)
      await User.populate(user, 'posts.title', (err, result) => {
       if(err) console.log(err)
       console.log('Error in user populate  :'+result)
      })

      console.log('User after population: ' + user)
    } else {
      let regExp = new RegExp(username, '1')
      user = await User.promise.findOne({
        username: {$regex: regExp}
      })
    }
    let dbUserName
    if(user){
      dbUserName = user.username
      if(username.indexOf('@')){
        dbUserName = user.email
      }
    }

    if (!user || username !== dbUserName) {
      console.log('In passport module - Invalid user')
      return [false, {message: 'Invalid username'}]
    }

    if (await user.validatePassword(password)) {
      console.log('In passport module - Invalid password')
      return [false, {message: 'Invalid password'}]
    }
    console.log('In passport module looks success. User = '+user)
    return user
  }, {spread: true})))

  console.log('In passport module - Check1')
  passport.serializeUser(nodeifyit(async (user) => user._id))
  passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
  }))

  passport.use('local-signup', new LocalStrategy({
    // Use "email" field instead of "username"
    usernameField: 'email',
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async (req, email, password) => {
      console.log('In passport local-signup = ' + email + '::' + password)
      email = (email || '').toLowerCase()
      // Is the email taken?
      if (await User.promise.findOne({email})) {
        return [false, {message: 'That email is already taken.'}]
      }

      let {username, title, description} = req.body
      //let regExp = new RegExp(username, '1')
      //let query = {username: {$regex: regExp}}
      let query = {username}
      if(await User.promise.findOne(query)){
        return [false, {message: 'That username is already taken.'}]
      }

      // create the user
      let user = new User()
      user.email = email
      user.username = username
      user.blogTitle = title
      user.blogDescription = description
      // Use a password hash instead of plain-text
      user.password = password
      try{
        console.log('In passport local-signup going to save')
        return await user.save()
      }catch(excep){
        console.log('Failed in local-signup'+util.inspect(excep))
        return [false, {message: excep.message}]
      }
  }, {spread: true})))
}
