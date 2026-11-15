
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Please enter valid details.");
      return;
    }

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth, email, password
      );

      await updateProfile(result.user, {
        displayName: name
      });

      navigate("/onboarding");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">

        <h1>Study<span>Room.</span></h1>

        <h2>Create Account</h2>
        <p className="subtitle">
          Start your learning journey with us.
        </p>

        <form onSubmit={handleSignup}>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

<div className="password-box">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Minimum 6 characters"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    minLength={6}
  />

  <button
    type="button"
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

          {error && <p className="error-message">{error}</p>}

          <button
  type="submit"
  className="signup-btn"
  disabled={loading}
>
  {loading ? "Creating Account..." : "Sign Up"}
</button>

        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;
