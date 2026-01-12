import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import style from './login.module.css';
import logo from '/logo.png';
import { loginApi } from '../../services/auth';

const Login = () => {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async () => {
        if (!login || !password) {
            setErrorMsg("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            setLoading(true);
            setErrorMsg("");
            const res = await loginApi(login, password);
            console.log("Login success:", res);

            if (!res.accessToken) {
                setErrorMsg("Không nhận được token");
                return;
            }

            const userData = {
                _id: res._id,
                email: res.email,
                username: res.username,
                avatar: res.avatar
            };

            localStorage.setItem("accessToken", res.accessToken);
            localStorage.setItem("user", JSON.stringify(userData));

            navigate("/", { 
                state: { token: res.accessToken, user: userData },
                replace: true
            });
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Đăng nhập thất bại");
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
                    <p>Dù bạn 'gà mờ' trong bếp hay đam mê nấu nướng,</p>
                    <p>KitchenWhiz sẽ biến mỗi bữa ăn thành một 'show diễn' cực chill!</p>
                </div>
                <div className={style.buttonContainer}>
                    <button className={style.button} onClick={() => navigate('/signup')}>Đăng ký</button>
                    <button className={style.button}>Tìm hiểu</button>
                </div>
            </div>
            <div className={style.right}>
                <div className={style.container}>
                    <div className={style.title}>ĐĂNG NHẬP</div>

                   <input
                       type="text"
                       placeholder="Email or Username"
                       className={style.inputField}
                       value={login}
                       onChange={(e) => setLogin(e.target.value)}
                   /> 

                   <input
                       type="password"
                       placeholder="Password"
                       className={style.inputField}
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                   />

                   <div className={style.forgotpassword} onClick={() => navigate('/forgot_password')}>Quên mật khẩu?</div>

                   {errorMsg && <div style={{ color: "red", marginBottom: 10 }}>{errorMsg}</div>}

                   <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <button className={style.button} onClick={handleLogin} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đăng nhập"}
                        </button>
                   </div>
                </div>
            </div>
         </div>
    );
};

export default Login;