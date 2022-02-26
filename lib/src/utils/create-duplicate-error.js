"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDuplicateError = void 0;
const admin_bro_1 = require("admin-bro");
const createDuplicateMessage = message => ({
    type: 'duplicate',
    message,
});
const createDuplicateError = ({ keyValue: duplicateEntry, errmsg }, document) => {
    if (!duplicateEntry) {
        const duplicatedKey = Object.keys(document).find(key => errmsg.includes(key));
        return new admin_bro_1.ValidationError({
            [duplicatedKey]: createDuplicateMessage(`Record with that ${duplicatedKey} already exists`),
        });
    }
    const [[keyName]] = Object.entries(duplicateEntry);
    return new admin_bro_1.ValidationError({
        [keyName]: createDuplicateMessage(`Record with that ${keyName} already exists`),
    });
};
exports.createDuplicateError = createDuplicateError;
//# sourceMappingURL=create-duplicate-error.js.map