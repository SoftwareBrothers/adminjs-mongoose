"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_bro_1 = require("admin-bro");
const factory_girl_1 = require("factory-girl");
const resource_1 = __importDefault(require("../../src/resource"));
const models_1 = require("../utils/models");
describe('Resource #find', () => {
    it('returns first n items', async () => {
        await factory_girl_1.factory.createMany('user', 10);
        const resource = new resource_1.default(models_1.User);
        const limit = 5;
        const offset = 0;
        const returnedItems = await resource.find(new admin_bro_1.Filter({}, models_1.User), {
            limit,
            offset,
        });
        expect(returnedItems.length).toEqual(limit);
        expect(returnedItems[0]).toBeInstanceOf(admin_bro_1.BaseRecord);
    });
});
//# sourceMappingURL=find.spec.js.map