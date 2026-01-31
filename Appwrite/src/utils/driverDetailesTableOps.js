
import AppwriteTablesDB from "../appwrite/appwriteTablesDB";
import { APPWRITE_DRIVERS_TABLE_ID } from "./constants";

const tablesDb = new AppwriteTablesDB();

const createDrivesDeatiles = async(data) =>{
    console.log(data);;
    
    const newUser = await tablesDb.createRow(APPWRITE_DRIVERS_TABLE_ID, data);
    return newUser;
}

const getDriverById = async(driverId) =>{
    const driver = await tablesDb.getRow(APPWRITE_DRIVERS_TABLE_ID , driverId)

    return driver;
}

const getDriverByUserId = async (userId) => {
  const rows = await tablesDb.listRows(
    APPWRITE_DRIVERS_TABLE_ID,
    {
      limit: 1000, // 🔥 IMPORTANT
    }
  );

  return rows.find((row) => row.userId === userId) || null;
};


export {createDrivesDeatiles , getDriverById , getDriverByUserId}
