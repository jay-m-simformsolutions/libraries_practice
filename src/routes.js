const express = require('express')

const routes = express.Router()

/* ====== for request 
    fetch('http://localhost:3003/api/r1/route1')
  .then(response => response.json())
  .then(data => {
    console.log(data)
  }) */
routes.get('/route1',(req,res,next) => {
    res.status(200).json({ message: '1st route'})
})

module.exports = routes
