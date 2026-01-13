import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../services/api";

const Signup = () => {
  const [form, setForm] = useState({
    name: "", age: "", city: "", email: "", password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signupUser(form);
      alert(res.message);

      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="bg-black p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Signup</h2>
        {["name","age","city","email","password"].map(field => (
          <input
            key={field}
            type={field==="password"?"password":"text"}
            placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
            name={field}
            value={form[field]}
            onChange={handleChange}
            className="w-full mb-4 p-2 border border-gray-500 rounded text-white bg-gray-800"
            required
          />
        ))}
        <button type="submit" className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
          Signup
        </button>
        <p className="text-center mt-4 text-white">
          Already have an account? <Link to="/login" className="text-red-400 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
