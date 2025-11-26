// import React, { createContext, useContext, useState } from 'react';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const savedUser = localStorage.getItem('user');
//     if (!savedUser || savedUser === "undefined") return null;
//     try {
//       return JSON.parse(savedUser);
//     } catch {
//       return null;
//     }
//   });

//   const [token, setToken] = useState(() => {
//     const savedToken = localStorage.getItem('token');
//     if (!savedToken || savedToken === "undefined") return null;
//     try {
//       return JSON.parse(savedToken);
//     } catch {
//       return null;
//     }
//   });

//   const login = (newToken, newUser) => {
//     setToken(newToken);
//     setUser(newUser);
//     localStorage.setItem('token', JSON.stringify(newToken));
//     localStorage.setItem('user', JSON.stringify(newUser));
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);



import React, { createContext, useContext, useState } from 'react';

// Create Auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Safely parse user and token from localStorage
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  const [user, setUser] = useState(() => {
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return storedToken ? JSON.parse(storedToken) : null;
    } catch {
      return null;
    }
  });

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', JSON.stringify(newToken));
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // redirect
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);
