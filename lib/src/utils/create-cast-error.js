"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCastError = void 0;
const admin_bro_1 = require("admin-bro");
const createCastError = (originalError) => {
    // cas error has only the nested path. So when an actual path is 'parents.age'
    // originalError will have just a 'age'. That is why we are finding first param
    // with the same value as the error has and path ending the same like path in
    // originalError or ending with path with array notation: "${path}.0"
    const errors = {
        [originalError.path]: {
            message: originalError.message,
            type: originalError.kind || originalError.name,
        },
    };
    return new admin_bro_1.ValidationError(errors);
};
exports.createCastError = createCastError;
//# sourceMappingURL=create-cast-error.js.map