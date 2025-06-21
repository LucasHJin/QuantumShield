"use client";
import React, { useState } from "react";

export default function UserAuth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(isLogin ? "Login successful!" : "Registration successful!");
        onLogin(
          { username: formData.username, email: formData.email },
          data.access_token
        );
      } else {
        setMessage(data.detail || "An error occurred");
      }
    } catch (error) {
      setMessage("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setIsLogin(true)}
          style={{
            padding: "10px 20px",
            marginRight: 10,
            backgroundColor: isLogin ? "#007bff" : "#f8f9fa",
            color: isLogin ? "white" : "black",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: !isLogin ? "#007bff" : "#f8f9fa",
            color: !isLogin ? "white" : "black",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div>
          <label style={{ display: "block", marginBottom: 5 }}>
            Username:
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        {!isLogin && (
          <div>
            <label style={{ display: "block", marginBottom: 5 }}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: 5 }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Loading..." : (isLogin ? "Login" : "Register")}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: 15,
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: message.includes("successful") ? "#d4edda" : "#f8d7da",
            color: message.includes("successful") ? "#155724" : "#721c24",
            border: `1px solid ${message.includes("successful") ? "#c3e6cb" : "#f5c6cb"}`,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
} 