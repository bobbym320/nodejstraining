let mongoose = require('mongoose')
//let bcrypt = require('bcrypt')
//let nodeifyit = require('nodeifyit')
let nodeify = require('bluebird-nodeify')

require('songbird')

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  blogTitle: String,
  blogDescription: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
})

userSchema.methods.generateHash = async function(password) {
  console.log('In generateHash')
  return await bcrypt.promise.hash(password, 8)
}

userSchema.methods.validatePassword = async function(password) {
  console.log('In validatePassword. password=' + password +'. this.password='+this.password)
  if (password !== this.password) {
        console.log('In validatePassword. returning invalid password')
        return [false, {message: 'Invalid password'}]
  }
}

userSchema.pre('save', function(callback){
  nodeify(async () => {
    console.log('In user pre save')
    if(!this.isModified('password')) return callback()
    this.password = await this.password
  }(), callback)
})

userSchema.path('password').validate((password) => {
  console.log('In user validate :: '+password)
  return password.length >=4 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
})

module.exports = mongoose.model('User', userSchema)
