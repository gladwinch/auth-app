const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateTodoInput(data) {
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.body = !isEmpty(data.body) ? data.body : '';


    if (Validator.isEmpty(data.title)) {
        errors.title = 'Title field is required';
    }

    if (Validator.isEmpty(data.body)) {
        errors.body = 'Description field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
