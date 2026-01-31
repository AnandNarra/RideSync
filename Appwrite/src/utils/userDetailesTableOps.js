
import AppwriteTablesDB from "../appwrite/appwriteTablesDB";
import { APPWRITE_USERS_TABLE_ID } from "./constants";


const tablesDb = new AppwriteTablesDB();

const createUserDetailes = async(data) =>{
    console.log("user final :-",data);;
    
    const newUser = await tablesDb.createRow(APPWRITE_USERS_TABLE_ID, data);
    return newUser;
}

const getUserByAuthId = async(userId) => {

    const user = await tablesDb.listRows(APPWRITE_USERS_TABLE_ID);

    return user.find(row => row.$id === userId) || null;
}

export {createUserDetailes , getUserByAuthId}