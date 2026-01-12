import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './verify_otp.module.css';
import { verifyOtpApi } from '../../services/auth';

const VerifyOtp = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;

    const email = location.state?.email;

    useEffect(() => {
        if (!email) navigate('/signup');

        setTimeout(() => {
        inputRefs.current[0]?.focus();
    }, 0);
    }, [email, navigate]);

    useEffect(() => {
    const otpCode = otp.join('');
    if (otpCode.length === 6 && !otp.includes('')) {
        handleSubmit(new Event('submit'));
    }
    }, [otp]);


    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);

        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').trim();

        if (/^\d{6}$/.test(paste)) {
            setOtp(paste.split(''));
            setTimeout(() => inputRefs.current[5]?.focus(), 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setErrorMsg('Hãy nhập mã OTP gồm 6 chữ số.');
            return;
        }

        try {
            setLoading(true);
            await verifyOtpApi(email, otpCode);
            if (from === 'forgot_password') {
                alert("OTP đã xác minh! Bạn có thể đặt lại mật khẩu.");
                navigate('/reset_password', { state: { email } });
            }
            else {
            alert("OTP đã xác minh! Bạn có thể đăng nhập.");
            navigate('/login');
            }
        } catch (e) {
            setErrorMsg(e.message || "Xác minh OTP thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div style={{ textAlign: 'center' }}>
                    <img src="/logo.png" className={styles.logo} alt="Logo" />
                    <div className={styles.title}>
                        Please, enter your OTP Code
                    </div>
                    <div className={styles.sentEmail}>
                        OTP sent to <b>{email}</b>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.input}>
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                className={styles.otpInput}
                                value={value}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                ref={(el) => inputRefs.current[index] = el}
                            />
                        ))}
                    </div>

                    {errorMsg && (
                        <div className={styles.error}>{errorMsg}</div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <button
                            type="submit"
                            className={styles.buttonverify}
                            disabled={loading}
                            >
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
