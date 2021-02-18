import { BaseDatabase } from 'admin-bro';
declare class Database extends BaseDatabase {
    private readonly connection;
    constructor(connection: any);
    static isAdapterFor(connection: any): boolean;
    resources(): any;
}
export default Database;
