import io from "socket.io-client";
const socket = io.connect("localhost:3001")



export { socket }