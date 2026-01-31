import { Client } from "appwrite";
import { APPWRITE_API_ENDPOINT, APPWRITE_PROJECT_ID } from "../utils/constants";


console.log(APPWRITE_API_ENDPOINT, APPWRITE_PROJECT_ID);


const appwriteClient = new Client();
    appwriteClient.setEndpoint(APPWRITE_API_ENDPOINT)
    appwriteClient.setProject(APPWRITE_PROJECT_ID)

export default appwriteClient