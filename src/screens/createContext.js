import { createContext, useState } from "react";

const UserType = createContext();

const UserContext = ({ children }) => {

    const [userID, setUserID] = useState("");
    return (
        <UserType.Provider value={{userID, setUserID}}>
            {children}
        </UserType.Provider>
    );
}


export { UserType, UserContext };