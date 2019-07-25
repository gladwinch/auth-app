const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateTodoInput = require('../../validation/todo');

// Load User model
const User = require('../../models/User')



// @route   GET api/users/profile
// @desc    Get user
// @access  Public
router.get('/profile',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        User.findById(req.user.id)
            .then(result => {
                res.send(result)
            })
            .catch(err => {
                res.send(err)
            })
})


// @route   GET api/users/profile
// @desc    Get user
// @access  Public
router.post('/edit',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {

    User.findById(req.user.id)
        .then(user => {
            
            user.location = req.body.location
            user.age = req.body.age
            user.avatar = req.body.avatar
            user.infoUpdate = true

            user.save()
                .then(result => res.send(result))
                .catch(err => res.status(400).json({
                    Error: err
                }))
        })
})

router.get('/get/todos',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {

        User.findById(req.user.id)
            .then(todo => {
                res.send(todo.todos)
            })
            .catch(err => {
                res.send({msg: "Unsuccsses ful"})
            })
})


router.post('/get/user',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {

        User.findById(req.user.id)
            .then(user => {
                res.send(user)
            })
            .catch(err => {
                res.status(400).send(err)
            })
    })



// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
    const {
        errors,
        isValid
    } = validateRegisterInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    
                    newUser
                        .save()
                        .then(user => {
                            
                            const payload = {
                                id: user.id,
                                name: user.name,
                            }

                            jwt.sign(
                                payload,
                                keys.secretOrKey, {
                                    expiresIn: 3600
                                },
                                (err, token) => {
                                    res.json({
                                        success: true,
                                        token: 'Bearer ' + token,
                                        user: user
                                    });
                                }
                            );
                        })
                        .catch(err => console.log(err));
                });
            });
        }
    });
});


// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
    const {
        errors,
        isValid
    } = validateLoginInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({
        email
    }).then(user => {
        // Check for user
        if (!user) {
            errors.message = 'User not found';
            return res.status(404).json(errors);
        }

        // Check Password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User Matched
                const payload = {
                    id: user.id,
                    name: user.name,
                }; // Create JWT Payload

                // Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey, {
                        expiresIn: 3600
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token,
                            user: user
                        });
                    }
                );
            } else {
                errors.message = 'Password incorrect';
                return res.status(400).json(errors);
            }
        });
    })
});


// @route   POST api/users/todo/add
// @desc    Add todo to user todo-list
// @access  Private
router.post(
    '/todo/add',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        const {
            errors,
            isValid
        } = validateTodoInput(req.body);

        // Check Validation
        if (!isValid) {
            return res.status(400).json(errors);
        }

        let todo = {
            title: req.body.title,
            body: req.body.body,
            time: req.body.time
        }

        User.findById(req.user.id)
            .then(user => {
                user.todos.unshift(todo)
                user.save()
                    .then(result => res.send(result.todos))
                    .catch(err => res.status(400).json({Error: err}))
            })

    }
)

// @route   DELETE api/users/todo/delete/id
// @desc    Delete post after complete or not
// @access  Private

router.delete(
        '/todo/delete/:id',
        passport.authenticate('jwt', {
            session: false
        }),
        (req, res) => {
            User.findById(req.user.id)
                .then(result => {
                    result.todos = result.todos.filter(todo => todo.id !== req.params.id)
                    result.save()
                        .then(result => {
                            res.send(result.todos)
                        })
                        .catch(err => res.status(404).send(err))
                })
        }
)


// @route   POST api/users/todo/edit/id
// @desc    Edit a todo
// @access  Private

router.post(
    '/todo/edit/:id',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        let todo = {
            title: req.body.title,
            body: req.body.body
        }

        User.findById(req.user.id)
            .then(result => {
                let todoEdit = result.todos.find(item => item._id == req.params.id)
                result.todos = result.todos.filter(item => item._id !== todoEdit._id)

                let editedTodo = {
                    ...todo,
                    _id: todoEdit._id,
                    time: todoEdit.time,
                }

                result.todos.push(editedTodo)
                let newSortedEdited = result.todos.sort((a, b) => a.time < b.time)
                result.todos = [...newSortedEdited]

                result.save()
                    .then(result => {
                    
                        res.send(result.todos)
                    })
                    .catch(err => res.status(404).send(err))
            })
    }
)

// @route   DELETE api/users/todo/delete
// @desc    Delete All Todo
// @access  Private

router.delete(
    '/todo/delete',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        User.findById(req.user.id)
            .then(result => {
                result.todos = []
                result.save()
                    .then(result => {
                        res.send(result)
                    })
                    .catch(err => res.status(404).send(err))
            })
    }
)


// @route   DELETE api/users/account/delete
// @desc    Delete Account
// @access  Private

router.delete(
    '/account/delete',
    passport.authenticate('jwt', {
        session: false
    }),
    (req, res) => {
        User.findByIdAndDelete(req.user.id)
            .then(result => {
                res.send({ success: true })
            })
            .catch(err => res.status(400).send(err))
    }
)




module.exports = router;