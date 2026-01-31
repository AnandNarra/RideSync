import { ID, TablesDB } from "appwrite"
import appwriteClient from "."
import { APPWRITE_DB_ID } from "../utils/constants"

class AppwriteTablesDB {
    constructor() {
        this.tablesDb = new TablesDB(appwriteClient)
    }

    async createRow(tableId, data) {
        try {
            console.log(data, tableId, APPWRITE_DB_ID);

            const result = await this.tablesDb.createRow({
                databaseId: APPWRITE_DB_ID,
                tableId: tableId,
                rowId: data.$id,
                data: data
            })

            return result

        } catch (error) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    async listRows(tableId) {

        try {

            console.log("TableId :- ", tableId);
            const result = await this.tablesDb.listRows({
                databaseId: APPWRITE_DB_ID,
                tableId: tableId
            });
            console.log("Tables", result);
            return result.rows

        } catch (error) {
            console.error(error)
            throw new Error(error.message)
        }

    }

    async getRow(tableId, rowId) {

        try {
            console.log("Tableid rowId", tableId, rowId);

            const result = await this.tablesDb.getRow({
                databaseId: APPWRITE_DB_ID,
                tableId: tableId,
                rowId: rowId
            });
            return result

        } catch (error) {
            console.log(error);
            throw new Error(error.message)
        }
    }
}

export default AppwriteTablesDB;