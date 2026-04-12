import http from "k6/http";

export const options = {
  vus: 100, // virtual users
  duration: "30s",
};

export default function () {
  http.get("http://localhost:5001/api/get-proxy-response?alias_key=4atYIayBGfOD3uKdpQ30OH8S");
}