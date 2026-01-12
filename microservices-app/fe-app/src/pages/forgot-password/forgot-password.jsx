import { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "../login/login.module.css";
import logo from "/logo.png";
import { forgotPasswordApi } from "../../services/auth";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordApi(email);
      alert("Đã gửi email khôi phục mật khẩu");
      navigate("/verify_otp", { state: { email, from: "forgot_password" } });
    } catch (err) {
      console.error("Forgot password error:", err);
      alert(err.message || "Gửi email thất bại");
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
            <button className={style.button} onClick={() => navigate('/signup')}>Đăng ký</button>
            <button className={style.button}>Tìm hiểu</button>
        </div>
      </div>

      <div className={style.right}>
        <div className={style.container}>
          <div className={style.title}>QUÊN MẬT KHẨU</div>

          <input
            type="email"
            placeholder="Email"
            className={style.inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div
            className={style.forgotpassword}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              className={style.button}
              onClick={handleForgotPassword}
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Quên mật khẩu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
