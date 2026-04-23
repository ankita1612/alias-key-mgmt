import React from "react";
import ProxyList from "./ProxyList";

function Proxy() {
  return (
    <>
      <ProxyList status="active"></ProxyList>
      <div className="pb-5"></div>
      <ProxyList status="deleted"></ProxyList>
    </>
  );
}

export default Proxy;
