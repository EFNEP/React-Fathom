import React, { useState } from "react";
import "./Form.css";

function Form({ onSubmit, onStopSimulation, simulationRunning }) {
  const [formData, setFormData] = useState({
    lat_max: "",
    lat_min: "",
    lon_max: "",
    lon_min: "",
    date: "",
    duration: "",
    resolution: "",
  });

  const [errors, setErrors] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    const { lat_max, lat_min, lon_max, lon_min, date, duration, resolution } = formData;
  
    if (!lat_max || lat_max < -90 || lat_max > 90) {
      newErrors.lat_max = "Northern Latitude must be between -90 and 90.";
    }
    if (!lat_min || lat_min < -90 || lat_min > 90) {
      newErrors.lat_min = "Southern Latitude must be between -90 and 90.";
    }
    if (lat_min && lat_max && parseFloat(lat_min) > parseFloat(lat_max)) {
      newErrors.lat_min = "Southern Latitude cannot be greater than Northern Latitude.";
    }
  
    if (!lon_max || lon_max < -180 || lon_max > 180) {
      newErrors.lon_max = "Eastern Longitude must be between -180 and 180.";
    }
    if (!lon_min || lon_min < -180 || lon_min > 180) {
      newErrors.lon_min = "Western Longitude must be between -180 and 180.";
    }
    if (lon_min && lon_max && parseFloat(lon_min) > parseFloat(lon_max)) {
      newErrors.lon_min = "Western Longitude cannot be greater than Eastern Longitude.";
    }
  
    if (!date) {
      newErrors.date = "Date is required.";
    }
    if (!duration || duration <= 0) {
      newErrors.duration = "Duration must be greater than 0.";
    }
    if (!resolution || resolution <= 0 || resolution > 1) {
      newErrors.resolution = "Resolution must be between 0 and 1.";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsRunning(true);
      await onSubmit(formData);  
    }
  };

  const handleStop = async () => {
    setIsRunning(false);
    await onStopSimulation(); 
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1 className="form-title">Visualization Form</h1>
   

      <div className="form-row">
        <div className="form-group">
          <label>Northern Latitude</label>
          <input
            type="number"
            name="lat_max"
            value={formData.lat_max}
            onChange={handleChange}
            placeholder="e.g., 45.0"
          />
          {errors.lat_max && <p className="error-text">{errors.lat_max}</p>}
        </div>

        <div className="form-group">
          <label>Southern Latitude</label>
          <input
            type="number"
            name="lat_min"
            value={formData.lat_min}
            onChange={handleChange}
            placeholder="e.g., -45.0"
          />
          {errors.lat_min && <p className="error-text">{errors.lat_min}</p>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Eastern Longitude</label>
          <input
            type="number"
            name="lon_max"
            value={formData.lon_max}
            onChange={handleChange}
            placeholder="e.g., 90.0"
          />
          {errors.lon_max && <p className="error-text">{errors.lon_max}</p>}
        </div>

        <div className="form-group">
          <label>Western Longitude</label>
          <input
            type="number"
            name="lon_min"
            value={formData.lon_min}
            onChange={handleChange}
            placeholder="e.g., -90.0"
          />
          {errors.lon_min && <p className="error-text">{errors.lon_min}</p>}
        </div>
      </div>
    <div className="form-row">
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        {errors.date && <p className="error-text">{errors.date}</p>}
      </div>

      <div className="form-group">
        <label>Duration (days)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g., 5.0"
        />
        {errors.duration && <p className="error-text">{errors.duration}</p>}
      </div>

      <div className="form-group">
        <label>Resolution (degrees)</label>
        <input
          type="number"
          name="resolution"
          value={formData.resolution}
          onChange={handleChange}
          placeholder="e.g., 0.5"
        />
        {errors.resolution && <p className="error-text">{errors.resolution}</p>}
      </div>
      </div>

      <div className="form-button-container">
        <button 
          type="submit" 
          className={`form-button run-simulation ${simulationRunning ? "disabled" : ""}`} 
          disabled={simulationRunning}
        >
          {simulationRunning ? "Simulation Running" : "Run Simulation"}
        </button>

        {simulationRunning && (
          <button 
            type="button" 
            className="stop-button" 
            onClick={handleStop}
          >
            Stop Simulation
          </button>
        )}
      </div>
    </form>
  );
}

export default Form;
