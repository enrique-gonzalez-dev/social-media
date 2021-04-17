'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination')
var User = require('../models/user');
var jwt = require('../services/jwt');

//Test methods
function home(req, res) {
    res.status(200).send({
        message: "You're in server"
    });
}

function tests(req, res) {
    console.log(req.body);

    res.status(200).send({
        message: "You're in test post method"
    });
}
//New register
function saveUser(req, res) {
    var params = req.body;
    var user = new User();
    if (params.name && params.surname &&
        params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER'
        user.image = null;

        //validate users
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de usuarios' });

            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario que intenta registar ya existe' });
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar usuario' });
                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'Usuario no registrado' });
                        }
                    });
                });
            }
        });

    } else {
        res.status(200).send({
            message: 'Envia todos los datos necesarios'
        });
    }
}
//Login
function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: "Error en la petición" });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //return data user
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: "Usuario no se ha podido identificar" });
                }
            });
        } else {
            return res.status(404).send({ message: "Usuario no se ha podido identificar!" });
        }
    });
}
//get an user
function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });

        if (!user) return reststatus(404).sent({ message: "El usuario no existe" });
        user.password = undefined;
        return res.status(200).send({ user });
    });
}

//Get pagination users

function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 5;
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });

        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });

        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    });
}

//Update users

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //delete password
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: "Sin permiso para actualizar datos de usuario" })
    }
    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' });
        if (!userUpdate) return res.status(404).send({ message: "No se ha podido actualizar el usuario" });

        return res.status(200).send({ user: userUpdate });
    });
}


module.exports = {
    home,
    tests,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser
}