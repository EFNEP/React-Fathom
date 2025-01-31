import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProgressBar.css";

const ProgressBar = ({ progress, logs, startTime, simulationCompleted }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [fileName, setFileName] = useState(null);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [downloadPromptVisible, setDownloadPromptVisible] = useState(false);

  const logsContainerRef = React.createRef();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (startTime && !simulationCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, simulationCompleted]);

  useEffect(() => {
    if (progress > 0 && elapsedTime > 0) {
      const estimatedRemaining = (elapsedTime / progress) * (100 - progress);
      setEstimatedTime(Math.round(estimatedRemaining));
    }
  }, [progress, elapsedTime]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (simulationCompleted && progress === 100) {
      const fileLog = logs.find((log) => log.message.includes("Filename:"));
      if (fileLog) {
        const match = fileLog.message.match(/Filename:\s([\w-]+\.nc)/);
        if (match) {
          setFileName(match[1]);
          console.log("File available for download:", match[1]);
        }
      }

      setTimeout(() => {
        setShowDownloadPrompt(true);
        setDownloadPromptVisible(true);
        setShowDetails(false);
      }, 1000);
    }
  }, [simulationCompleted, logs, progress]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const handleDownload = async () => {
    if (!fileName) return;

    console.log("Attempting to download file:", fileName);
    const response = await fetch(
      `http://54.234.185.22:5000/download/${fileName}`
    );
    console.log("Download API response:", response);

    if (!response.ok) {
      console.log("Failed to download the file.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCancelDownload = () => {
    setDownloadPromptVisible(false);
  };

  const handleVisualize = () => {
    navigate("/visualise");
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-background">
        <div
          className="progress-bar-foreground"
          style={{ width: `${progress}%` }}
        >
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="progress-time-info">
        <div>Elapsed Time: {formatTime(elapsedTime)}</div>
        {estimatedTime > 0 && (
          <div>Estimated Time Left: {formatTime(estimatedTime)}</div>
        )}
      </div>

      {showDetails && (
        <div className="progress-log" ref={logsContainerRef}>
          <ul>
            {logs.map((log, index) => (
              <li key={index} className="log-item">
                <strong>{log.status}%</strong> - {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="view-details-button"
      >
        {showDetails ? "Hide Details" : "View Details"}
      </button>

      {downloadPromptVisible && showDownloadPrompt && (
        <div className="download-prompt">
          <p>The simulation is complete. Do you want to download the file?</p>
          <button onClick={handleDownload} className="download-button">
            Yes
          </button>
          <button onClick={handleCancelDownload} className="cancel-button">
            No
          </button>
        </div>
      )}
      {simulationCompleted && progress === 100 && (
        <div className="visualize-button-container">
          <button onClick={handleVisualize} className="visualize-button">
            Visualize the Data
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
