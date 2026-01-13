import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      
      });

      const data = await res.json();

      if (!res.ok) {
        
        return alert(data.message || "Login failed");
      }

      // Success
      alert(data.message);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-black p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>

        {["email", "password"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            name={field}
            value={form[field]}
            onChange={handleChange}
            className="w-full mb-4 p-2 border border-gray-500 rounded text-white bg-gray-800"
            required
          />
        ))}

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Login
        </button>

        <p className="text-center mt-4 text-white">
          Don't have an account?{" "}
          <Link to="/signup" className="text-red-400 hover:underline">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
