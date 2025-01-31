import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Form from "./components/Form";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProgressBar from "./components/ProgressBar";
import MapComponent from "./components/Map";

import "./App.css";

function App() {
  const [progress, setProgress] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [filename, setFilename] = useState(null);
  const [simulationAbortController, setSimulationAbortController] =
    useState(null);

  const handleSimulationStart = async (formData) => {
    console.log("Submitting Form Data:", formData);

    const processedData = {
      lat_max: parseFloat(formData.lat_max),
      lat_min: parseFloat(formData.lat_min),
      lon_max: parseFloat(formData.lon_max),
      lon_min: parseFloat(formData.lon_min),
      date: formData.date,
      duration: parseFloat(formData.duration),
      resolution: parseFloat(formData.resolution),
    };

    console.log("Processed Form Data:", processedData);

    setProgress([]);
    setLogs([]);
    setSimulationRunning(true);
    setSimulationCompleted(false);
    setStartTime(Date.now());
    setFilename(null);

    const abortController = new AbortController();
    setSimulationAbortController(abortController);

    try {
      const response = await fetch(
        "http://54.234.185.22:5000/run-simulation/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processedData),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedData = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        receivedData += decoder.decode(value, { stream: true });

        let startIdx = 0;
        while (true) {
          const openBraceIdx = receivedData.indexOf("{", startIdx);
          const closeBraceIdx = receivedData.indexOf("}", startIdx);

          if (openBraceIdx === -1 || closeBraceIdx === -1) {
            break;
          }

          const jsonString = receivedData.slice(
            openBraceIdx,
            closeBraceIdx + 1
          );
          try {
            const parsedUpdate = JSON.parse(jsonString);
            parsedUpdate.status = parsedUpdate.status * 100;

            if (parsedUpdate.message.startsWith("Filename: ")) {
              const match = parsedUpdate.message.match(
                /Filename:\s([\w-]+\.nc)/
              );
              if (match) {
                setFilename(match[1]);
                console.log("Extracted filename:", match[1]);
              } else {
                console.error(
                  "Failed to extract filename:",
                  parsedUpdate.message
                );
              }
            }

            setLogs((prevLogs) => [
              ...prevLogs,
              { status: parsedUpdate.status, message: parsedUpdate.message },
            ]);
            setProgress((prevProgress) => [...prevProgress, parsedUpdate]);
          } catch (err) {
            console.warn("Skipping invalid JSON:", jsonString);
          }

          receivedData = receivedData.slice(closeBraceIdx + 1);
        }
      }

      setSimulationRunning(false);
      setSimulationCompleted(true);
      console.log("Simulation completed!");
    } catch (error) {
      if (abortController.signal.aborted) {
        console.log("Simulation was stopped by the user.");
      } else {
        console.error("Error running simulation:", error);
      }
      setSimulationRunning(false);
    }
  };

  const handleSimulationStop = () => {
    if (simulationAbortController) {
      simulationAbortController.abort();
      setSimulationRunning(false);
      setLogs((prevLogs) => [...prevLogs, { message: "Simulation Stopped." }]);
      console.log("Simulation stopped by user.");
    }
  };

  const currentProgress =
    progress.length > 0 ? progress[progress.length - 1].status : 0;

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-container">
          <div className="container max-w-4xl px-6 py-12">
            <center>
              <h1 className="main-heading">Welcome to Blue Wave Tech</h1>
            </center>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Form
                      onSubmit={handleSimulationStart}
                      simulationRunning={simulationRunning}
                      onStopSimulation={handleSimulationStop}
                    />
                    {(simulationRunning || simulationCompleted) && (
                      <ProgressBar
                        progress={currentProgress}
                        logs={logs}
                        startTime={startTime}
                        simulationCompleted={simulationCompleted}
                      />
                    )}
                  </>
                }
              />
              <Route path="/visualise" element={<MapComponent />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
