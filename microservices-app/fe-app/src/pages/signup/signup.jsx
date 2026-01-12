import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "../login/login.module.css";
import logo from "/logo.png";
import { registerApi } from "../../services/auth";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !username || !password || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      const res = await registerApi(email, username, password);
      console.log("Register success:", res);

      alert("Đăng ký thành công! Vui lòng kiểm tra email để nhập OTP.");

      navigate("/verify_otp", { state: { email, from: "signup" } });
    } catch (err) {
      alert(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.background}>
      <div className={style.left}>
        <img src={logo} alt="KitchenWhiz Logo" className={style.logo} />
        <div className={style.textpreview}>
          <p>Không cần phải là MasterChef, chỉ cần KitchenWhiz.</p>
          <p>Bạn chỉ việc chọn nguyên liệu, còn lại để KitchenWhiz lo.</p>
          <p>Dù bạn ‘gà mờ’ trong bếp hay đam mê nấu nướng,</p>
          <p>KitchenWhiz sẽ biến mỗi bữa ăn thành một ‘show diễn’ cực chill!</p>
        </div>
        <div className={style.buttonContainer}>
          <button
            className={style.button}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
          <button className={style.button}>Tìm hiểu</button>
        </div>
      </div>

      <div className={style.right}>
        <div className={style.container}>
          <div className={style.title}>ĐĂNG KÝ</div>

          <input
            type="email"
            placeholder="Email"
            className={style.inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            className={style.inputField}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className={style.inputField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className={style.inputField}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              className={style.button}
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
