'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3800;

//Connection db
mongoose.Promisse = global.Promisse;
mongoose.connect('mongodb://localhost:27017/nvagu_local', { useMongoClient: true })
    .then(() => {
        console.log("La conexion a la base de datos nvagu es exitosa");
        //create server
        app.listen(port, () => {
            console.log("Server ir running http://localhost:3800");
        });
    })
    .catch(err => console.log(err));