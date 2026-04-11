// import { Server } from "socket.io";
// import cookie from "cookie";
// import jwt from "jsonwebtoken";

// let io: Server;

// export const initSocket = (server: any) => {
//   io = new Server(server, {
//     cors: {
//       origin: "http://localhost:3000", // your frontend
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     try {
//       const cookies = cookie.parse(socket.handshake.headers.cookie || "");
//       const token = cookies.userToken;

//       if (!token) {
//         console.log("No token → disconnect");
//         socket.disconnect(); // ✅ IMPORTANT
//         return;
//       }

//       const decoded: any = jwt.verify(token, "YOUR_SECRET_KEY");

//       const userId = decoded.id;

//       socket.join(userId);

//       console.log("User connected:", userId);
//     } catch (err) {
//       console.log("Socket auth error");
//       socket.disconnect(); // ✅ IMPORTANT
//     }
//   });

//   return io;
// };

// export const getIO = () => io;
