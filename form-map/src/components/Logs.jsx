import React from "react";

function Logs({ logs }) {
  return (
    <div className="mt-4 p-2 border rounded h-40 overflow-auto bg-gray-100">
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  );
}

export default Logs;
