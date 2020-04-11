import createError from 'http-errors'
import express from 'express'
import path from 'path'
import session from 'express-session'
import logger from 'morgan'
import nodeSassMiddleware from 'node-sass-middleware'
import fileUpload from 'express-fileupload'
// Routers
import homeRouter from './routes/home'
import loginRouter from './routes/login'
import registerRouter from './routes/register'
import userRouter from './routes/user'
import settingsRouter from './routes/settings'
import logutRouter from './routes/logout'
import postRouter from './routes/post'
import threadRouter from './routes/thread'


const app = express()
const sessionSettings = {
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET,
    sameSite: true,
    resave: true,
    saveUninitalized: true
}

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

/*========== Middleware ==========*/

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(session({
    name: sessionSettings.name,
    secret: sessionSettings.secret,
    cookie: {
        sameSite: sessionSettings.sameSite,
        resave: sessionSettings.resave,
        saveUninitalized: sessionSettings.saveUninitalized,
    }
}))
app.use(nodeSassMiddleware({
    src: path.join(__dirname, '/scss'),
    dest: path.join(__dirname, '/public/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/css'
}))
app.use(fileUpload())

function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        next()
    } else {
        res.redirect('/login')
    }
}

function isLoggedOut(req, res, next) {
    if (req.session.userId) {
        res.redirect('/home')
    } else {
        next()
    }
}

/*========== Routing ==========*/

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Route handling
app.all('/', isLoggedIn, function(req, res) { res.redirect('home') })
app.use('/home', isLoggedIn, homeRouter)
app.use('/user', isLoggedIn, userRouter)
app.use('/settings', isLoggedIn, settingsRouter)
app.use('/login', isLoggedOut, loginRouter)
app.use('/logout', isLoggedIn, logutRouter)
app.use('/register', isLoggedOut, registerRouter)
app.use('/post', isLoggedIn, postRouter)
app.use('/thread', isLoggedIn, threadRouter)


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})

// Error handler
app.use(function(err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // Render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
