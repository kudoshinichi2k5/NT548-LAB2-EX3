import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import style from "../login/login.module.css";
import { resetPasswordApi } from "../../services/auth";
import logo from "/logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; 

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!email) navigate('/login'); 
  }, [email, navigate]);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi(email, newPassword);
      alert("Reset mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Reset password thất bại");
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
      </div>

      <div className={style.right}>
        <div className={style.container}>
          <div className={style.title}>TẠO MẬT KHẨU MỚI</div>

          <input
            type="password"
            placeholder="New Password"
            className={style.inputField}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className={style.inputField}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {errorMsg && <div style={{ color: "red", marginBottom: 10 }}>{errorMsg}</div>}

          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <button
              className={style.button}
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Tạo mật khẩu mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
