// import React, { useState, useEffect } from "react";
// import "../styles/Header.css";
// import { jwtDecode } from "jwt-decode";

// const Header = ({ userRole, isSidebarCollapsed }) => {
//   const [userName, setUserName] = useState("User");

//   useEffect(() => {
//     const fetchUserName = () => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         try {
//           const decoded = jwtDecode(token);
//           const userId = decoded.user_id;
//           fetch(`http://localhost:8000/users/${userId}`, {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           })
//             .then((response) => {
//               if (!response.ok) throw new Error("Failed to fetch user details");
//               return response.json();
//             })
//             .then((userData) => {
//               setUserName(userData.name || "User");
//             })
//             .catch((error) => {
//               console.error("Error fetching user details:", error);
//               setUserName("User");
//             });
//         } catch (error) {
//           console.error("Error decoding token:", error);
//           setUserName("User");
//         }
//       }
//     };
//     fetchUserName();
//   }, []);

//   if (!userRole) return null;

//   return (
//     <header className={`header ${isSidebarCollapsed ? "collapsed" : ""}`}>
//       <div className="welcome-message">
//         Welcome, {userName} ({userRole})
//       </div>
//     </header>
//   );
// };

// export default Header;
import React, { useState, useEffect } from "react";
import "../styles/Header.css";
import { jwtDecode } from "jwt-decode";

const Header = ({ userRole, isSidebarCollapsed }) => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserName = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const userId = decoded.user_id;
          fetch(`http://localhost:8000/users/${userId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => {
              if (!response.ok) throw new Error("Failed to fetch user details");
              return response.json();
            })
            .then((userData) => {
              setUserName(userData.name || "User");
            })
            .catch((error) => {
              console.error("Error fetching user details:", error);
              setUserName("User");
            });
        } catch (error) {
          console.error("Error decoding token:", error);
          setUserName("User");
        }
      }
    };
    fetchUserName();
  }, []);

  if (!userRole) return null;

  return (
    <header className={`header ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="welcome-message">
        Welcome, {userName} ({userRole})
      </div>
    </header>
  );
};

export default Header;