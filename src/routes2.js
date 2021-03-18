const express = require('express')

const routes2 = express.Router()

/* ====== for request 
    fetch('http://localhost:3003/api/r2/route2/get')
  .then(response => response.json())
  .then(data => {
    console.log(data)
  }) */
routes2.get('/route2/get',(req,res,next) => {
    res.status(200).json({ message: '2nd route get', token: req.csrfToken()})
})


/* ====== for request 
    fetch('http://localhost:3003/api/r2/route2/post',{method: 'POST'})
  .then(response => response.json())
  .then(data => {
    console.log(data)
  }) 
  
  ---- require csrf token in req to access this route
  */
routes2.post('/route2/post',express.urlencoded({ extended: false }),(req,res,next) => {
    console.log(req.body);
    console.log(req.body);
    res.status(200).json({ message: '2nd route post'})
})

module.exports = routes2
