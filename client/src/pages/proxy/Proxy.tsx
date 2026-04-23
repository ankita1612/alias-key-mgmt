import React from "react";
import ProxyList from "./ProxyList";

function Proxy() {
  return (
    <>
      <ProxyList status="active"></ProxyList>
      <ProxyList status="deleted"></ProxyList>
    </>
  );
}

export default Proxy;
