import React, { useState } from "react";
import axios from "axios";

function PredictForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    skin_type: "",
    pigmentation: "",
    sun_exposure: ""
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const age = Number(formData.age);
    const skin_type = Number(formData.skin_type);
    const pigmentation = Number(formData.pigmentation);
    const sun_exposure = Number(formData.sun_exposure);

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (isNaN(age) || age < 1 || age > 120) newErrors.age = "Please enter a valid age (1-120)";
    if (isNaN(skin_type) || skin_type < 1 || skin_type > 6) newErrors.skin_type = "Skin type must be between 1 and 6 (Fitzpatrick Scale)";
    if (isNaN(pigmentation) || pigmentation < 0) newErrors.pigmentation = "Pigmentation value must be a positive number";
    if (isNaN(sun_exposure) || sun_exposure < 0) newErrors.sun_exposure = "Sun exposure value must be a positive number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const user = JSON.parse(localStorage.getItem("user"));

// inside PredictForm.js (or wherever handleSubmit lives)
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ✅ use values from formData, not undefined vars
  const payload = {
    user_id: user?.id || null,
    age: formData.age,
    skin_type: formData.skin_type,
    pigmentation: formData.pigmentation,
    sun_exposure: formData.sun_exposure,
  };

  console.log("📤 Sending payload:", payload);

  try {
    setLoading(true);
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      console.error("❌ Prediction failed:", data);
      alert(data.error || "Prediction failed");
      return;
    }

    console.log("✅ Prediction result:", data);
    setResult(data);
  } catch (err) {
    setLoading(false);
    console.error("⚠️ Network or fetch error:", err);
    alert("Server not reachable or internal error — check Flask terminal.");
  }
};


  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      skin_type: "",
      pigmentation: "",
      sun_exposure: ""
    });
    setResult(null);
    setErrors({});
  };

  // Inline styles optimized for the dark theme and two-column layout
  const styles = {
    // CONTAINER: Ensure no background is set here, allowing App.js background to show through.
    container: {
      padding: '2rem 1rem', // Retain padding for inner content spacing
    },
    // CARD: Slightly darker to provide contrast with the main app background
    card: {
      background: '#111827', // Darker than #1f2937
      borderRadius: '1rem',
      border: '1px solid #374151',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
      animation: 'slideUp 0.5s ease-out'
    },
    // INPUT FIE0
    input: {
      width: '100%',
      padding: '0.75rem 0.3rem',
      backgroundColor: '#1f2937', // Darker input field background
      border: '1px solid #4b5563',
      borderRadius: '0.5rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none', // Remove default focus outline
    },
    inputFocus: {
      borderColor: '#2563eb', // Blue border on focus
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.5)'
    },
    inputError: {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)'
    },
    // BUTTONS
    button: {
      flex: '1',
      background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)', // Lighter blue gradient
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      outline: 'none',
    },
    // RESULT CARD
    resultCard: {
      background: '#1f2937',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid #4b5563',
      marginTop: '2rem',
      animation: 'fadeIn 0.5s ease-in-out'
    },
    progressBar: {
      width: '100%',
      backgroundColor: '#374151',
      borderRadius: '9999px',
      height: '0.5rem'
    }
  };

  // Helper function to render an input field
  const InputField = ({ field, label, type, placeholder, min, max, step }) => {
    return (
      <div style={{ marginBottom: errors[field] ? '0.5rem' : '1.5rem' }}> {/* Adjusted margin based on error */}
        <label htmlFor={field} style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#d1d5db', marginBottom: '0.5rem' }}>
          {label}
        </label>
        <input
          id={field}
          type={type}
          name={field}
          value={formData[field]}
          onChange={handleChange}
          style={{
            ...styles.input,
            ...(errors[field] && styles.inputError)
          }}
          onFocus={(e) => {
            e.target.style.borderColor = styles.inputFocus.borderColor;
            e.target.style.boxShadow = styles.inputFocus.boxShadow;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = errors[field] ? styles.inputError.borderColor : styles.input.borderColor;
            e.target.style.boxShadow = errors[field] ? styles.inputError.boxShadow : 'none';
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
        />
        {errors[field] && (
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#f87171', animation: 'fadeIn 0.5s ease-in-out' }}>
            {errors[field]}
          </p>
        )}
      </div>
    );
  };


  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        
        {/* Header - Should really be in App.js Hero section, but kept here if it's specific to the form */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeIn 0.5s ease-in-out' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            Melasma Risk Assessment
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Complete the form below to assess your risk.
          </p>
        </div>

        {/* Form Card */}
        <div style={styles.card}>
          <div style={{ padding: '2rem' }}>
            {errors.submit && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '0.5rem',
                animation: 'shake 0.5s ease-in-out'
              }}>
                <p style={{ color: '#fecaca', display: 'flex', alignItems: 'center' }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.submit}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* FIXED: TWO-COLUMN LAYOUT GRID */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '1.5rem' // Gap between columns and rows
              }}>
                {/* Each InputField now correctly takes up a column slot */}
                <InputField 
                  field="name" 
                  label="Name" 
                  type="text" 
                  placeholder="Enter your full name" 
                />
                <InputField 
                  field="age" 
                  label="Age" 
                  type="number" 
                  placeholder="Enter your age (1-120)" 
                  min={1} 
                  max={120} 
                />
                <InputField 
                  field="skin_type" 
                  label="Skin Type (Fitzpatrick 1-6)" 
                  type="number" 
                  placeholder="e.g., 4" 
                  min={1} 
                  max={6}
                />
                <InputField 
                  field="pigmentation" 
                  label="Pigmentation Score" 
                  type="number" 
                  placeholder="e.g., 8.2" 
                  min={0}
                  step={0.1}
                />
                {/* This field will span both columns if placed last, or fit into the next available grid cell */}
                <div style={{ gridColumn: 'span 2' }}> 
                    <InputField 
                        field="sun_exposure" 
                        label="Sun Exposure (Annual Score)" 
                        type="number" 
                        placeholder="e.g., 5.5" 
                        min={0}
                        step={0.1}
                    />
                </div>
              </div>

              {/* Buttons (Full width below the grid) */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...(loading ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
                  onMouseOut={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ animation: 'spin 1s linear infinite', marginRight: '0.75rem', width: '1.25rem', height: '1.25rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    "Assess Risk"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#374151',
                    color: '#d1d5db',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Results Section */}
            {result && (
              <div style={styles.resultCard}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.5rem', color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Assessment Results
                </h3>
                
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: result.prediction === 1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: `1px solid ${result.prediction === 1 ? '#ef4444' : '#22c55e'}`,
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      Prediction:{" "}
                      <span style={{ color: result.prediction === 1 ? '#fca5a5' : '#86efac' }}>
                        {result.prediction === 1 ? "Melasma Detected" : "No Melasma Detected"}
                      </span>
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151' }}>
                    <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '0.75rem' }}>Risk Probabilities:</h4>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {[
                        { label: 'Mild', color: '#eab308', index: 0 },
                        { label: 'Moderate', color: '#f97316', index: 1 },
                        { label: 'Severe', color: '#ef4444', index: 2 }
                      ].map((item) => (
                        <div key={item.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.25rem' }}>
                            <span>{item.label}</span>
                            <span>{(result.probability[item.index] * 100).toFixed(2)}%</span>
                          </div>
                          <div style={styles.progressBar}>
                            <div 
                              style={{
                                backgroundColor: item.color,
                                height: '0.5rem',
                                borderRadius: '9999px',
                                width: `${result.probability[item.index] * 100}%`,
                                transition: 'width 1s ease-out'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280', fontSize: '0.875rem', animation: 'fadeIn 0.5s ease-in-out' }}>
          <p>This assessment is for informational purposes only. Please consult a healthcare professional for medical advice.</p>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PredictForm;