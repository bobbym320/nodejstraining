let multiparty = require('multiparty')
let then = require('express-then')
let fs = require('fs')
let DataUri = require('datauri')
let nodeify = require('bluebird-nodeify')

let Post = require('./models/post')
let User = require('./models/user')
let isLoggedIn = require('./middleware/isLoggedIn')

module.exports = (app) => {
  let passport = app.passport

  app.get('/', (req, res) => {
    console.log('In app.get /');
    res.render('index.ejs')
  })

  app.get('/login', (req, res) => {
    console.log('In app.get /login');
    res.render('login.ejs', {message: req.flash('error')})
  })

  app.get('/signup', (req, res) => {
    console.log('In app.get /signup');
    res.render('signup.ejs', {message: req.flash('error')})
  })

  app.get('/post/:postId?', then(async (req, res) => {
      console.log('In app.get /post/postId');
      let postId = req.params.postId
      if(!postId){
        res.render('post.ejs', {
          post: {},
          verb: 'Create'
        })
        return
      }
      let post = await Post.promise.findById(postId)
      console.log(postId, post)
      if(!postId) res.send('404', 'Not Found')
      let dataUri = new DataUri

      let image = ''
      if(post.image.contentType){
        image = `data:${post.image.contentType};base64,${image.base64}`
      }

      //let image = dataUri.format('.'+post.image.contentType.split('/').pop(), post.image.data)
      res.render('post.ejs', {
          post: post,
          verb: 'Edit',
          image: image
      })
      return
    }))

  app.post('/login', (req,res,next) => {
    console.log('In app.post /login')
    next()
  },passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))
  // process the signup form
  app.post('/signup', (req,res,next) => {
    console.log('In app.post /signup')
    next()
  },passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  app.post('/post/:postId?', then(async (req, res) => {
      console.log('In app.post /post/postId req.params='
          +'::'+req.params.content+'::'+'::'+req.body.content+'--'+JSON.stringify(req.body));

      let postId = req.params.postId
      //let [{title: [title], content: [content]}, {image: [file]}] = await new multiparty.Form().promise.parse(req)
      let userId = req.user._id
      if(!postId){
        let post = new Post()
        post.userid = userId.toString()
        post.creator = userId
        post.title = req.body.title
        post.content = req.body.content
        if(req.body.image){
          post.image.data = await fs.promise.readFile(req.body.image)
          post.image.contentType = "image/gif"
        }
        await post.save()

        //save the user references to post
        let user = await User.promise.findById(userId)
        user.posts.push(post)
        await user.save()
        res.redirect('/blog/'+userId)
        return
      }

      let post = await Post.promise.findById(postId)
      if(!post) res.send('404', 'Not Found')
      post.title = req.body.title
      post.content = req.body.content
      if(req.body.image){
        post.image.data = await fs.promise.readFile(req.body.image)
        post.image.contentType = "image/gif"      
      }

      post.updated = Date.now()
      await post.save()
      res.redirect('/blog/'+userId)
    }))

  app.post('/delete/:postId?', then(async (req, res) => {
      console.log('In app.post /delete/postId');
      let postId = req.params.postId
      console.log('Deleting post: ' + postId)
      if(!postId){
        res.redirect('/profile')
        return
      }

      let post = await Post.promise.findById(postId)
      console.log('Post to be deleted: ' + post)
      await post.remove((err) => {
        if(err) console.log('Error deleting post..' + err)
        console.log('Post deleted successfully..')
      })
      console.log('Deleted document: ' + post)
      if(!post) res.send('404', 'Not Found')
      res.redirect('/profile')
    }))

  app.get('/profile', isLoggedIn, then(async (req, res) => {
    console.log('In app.get /profile');
    let posts = await Post.promise.find({userid: req.user._id.toString()})

    nodeify(async () => {
      await posts.populate()
      // .exec((err, result) => {
      //   if (err) console.log(err)
      //   console.log('result', result)
      // })
    }(), (err, result) => {
      if(err) console.log(err)
      console.log('Result: ' + result)
      console.log('posts: ' + posts)
    })
    // populate the user data to be populated in the profile page

    res.render('profile.ejs', {
      user: req.user,
      posts: posts,
      message: req.flash('error')
    })
  }))

  app.get('/logout', (req, res) => {
    console.log('In app.get /logout');
    req.logout()
    res.redirect('/')
  })

  app.get('/blog/:blogId?', then(async (req, res) => {
    console.log('In app.get /blog/blogId');
    let blogId = req.params.blogId
    if(!blogId) res.send('404', 'Not Found')
    if(!req.isAuthenticated()){
      res.render('login.ejs', {message: 'Please login to proceed'})
      return
    }
    let posts = await Post.promise.find({userid: blogId})
    console.log(blogId)
    // populate the user data to be populated in the profile page
    // posts = await Post.promise.populate(posts, {
    //   path: 'creator',
    //   match: { _id: blogId},
    // })
    console.log('Posts: ' + posts)
    let blogPosts = []
    for (let i = 0; i < posts.length; i++) {
      let blogPost = {}
      let dataUri = new DataUri
      if(posts[i].image.contentType){
        console.log('posts[i].image=='+posts[i].image)
        let image = dataUri.format('.'+posts[i].image.contentType.split('/').pop(), posts[i].image.data)
        blogPost.image = `data:${posts[i].image.contentType};base64,${image.base64}`
      }
      blogPost.id = posts[i].id
      blogPost.title = posts[i].title
      blogPost.content = posts[i].content
      blogPost.updated = posts[i].updated
      blogPost.blogId = posts[i].userid
      blogPost.comments = []
      blogPost.comments = (posts[i].comments).slice()
      blogPosts.push(blogPost)
    }
    console.log('blogPosts' + JSON.stringify(blogPosts))
    res.render('blog.ejs', {
        blogPosts: blogPosts,
        verb: 'View'
    })
    return
  }))

 app.post('/comment/:postId?', then(async (req, res) => {
      console.log('In app.post /comment/postId' + req.body.commentparam +'::'+req.body.blogId)
      let postId = req.params.postId
      //let [{commentparam: [commentparam], blogId: [blogId]}] = await new multiparty.Form().promise.parse(req)
      //console.log(commentparam, blogId)
      let post = await Post.promise.findById(postId)
      console.log('Before: ' + post)
      if(!post) res.send('404', 'Not Found')
      let comment = {}
      comment.body = req.body.commentparam
      comment.created = Date.now()
      comment.creator = req.user.username
      post.comments.push(comment)
      await post.save()
      res.redirect('/blog/'+req.body.blogId)
  }))

}
