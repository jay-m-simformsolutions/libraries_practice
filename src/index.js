const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const csrf = require('csurf')

const routes = require('./routes')
const routes2 = require('./routes2')

const app = express()

app.use(express.json())

/* -------------------- helmet --------------------*/

//read https://expressjs.com/en/advanced/best-practice-security.html#:~:text=Use%20Helmet,-Helmet%20can%20help&text=csp%20sets%20the%20Content%2DSecurity,and%20other%20cross%2Dsite%20injections.&text=frameguard%20sets%20the%20X%2DFrame,XSS)%20filter%20in%20web%20browsers
// ====== prevent xss-cross site scripting attacks by hiding http headers
app.use(helmet())
// app.disable('X-Powered-By')
// app.use(helmet.hidePoweredBy())

/* -------------------- cors --------------------*/


// ======= for one host
// const corsOpt = {
    //     origin: 'http://ontime.simformsolutions.in',
    //     optionsSuccessStatus: 200
    // }
    
// ======= for multiple host
const whiteList = ['http://ontime.simformsolutions.com', 'http://example.com']
const corsOpt = {
    origin: function(origin, callback) {
        if(whiteList.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS policy'))
        }
    }
}
app.use(cors(corsOpt))

app.use(cookieParser())
app.use('/api/r1', routes)

/* -------------------- csrf --------------------*/

app.use('/api/r2', csrf({ cookie: true }), routes2)

app.use(function (err, req, res, next) {
    if(err.code !== 'EBADCSRFTOKEN') {
        return next(err)
    }
    console.log(req.headers);
    res.status(403)
    res.send('from tampred with')
})

app.listen(3003, () => {
    console.log('Server running on 3003');
})
