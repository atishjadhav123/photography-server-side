const validator = require("validator");

exports.checkempty = (fields) => {
    const error = {};
    let isError = false;

    for (const key in fields) {
        if (!fields[key] || validator.isEmpty(String(fields[key]).trim())) {
            error[key] = `${key} is required`;
            isError = true;
        }
    }

    return { isError, error };
};
