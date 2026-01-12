import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import style from './add_food.module.css';
import logo from '/logo.png';
import styleBar from '../../components/bar.module.css';
import temp from '/temp.jpg'
import uploadphotos from '/uploadphotos.png'

const AddFoodPage = () => {
    const navigate = useNavigate();
    useEffect(() => {}, []);

    return (
        <div className={style.background}>
            <div className = {styleBar.top}>
                <div className={styleBar.bar}>
                    <img src={logo} alt="Logo" className={styleBar.logo} onClick={() => navigate('/')} />
                    <div className={styleBar.textbar}>Chào mừng, Uyên Thy</div>
                        <div className={styleBar.avatarcontainer}>
                            <img src={temp} alt="Avatar" className={styleBar.avatar} />
                        </div>
                    </div>
            </div>
            <div className={style.title}>Thêm món ăn</div>
            <div className={style.container}>
                <div className={style.titleContainer}>Nhập thông tin món ăn</div>
                <div className={style.containerFoodandImg}>
                    <img src={uploadphotos} alt="Food" className={style.imageFood} />
                    <div className={style.containerName}>
                        <div className={style.titleInput}>Tên món ăn</div>
                        <input type="text" className={style.inputBox} placeholder="Bún bò Huế" />
                        <div className={style.titleInput}>Mô tả</div>
                        <textarea className={style.textAreaBox} placeholder="Bún Bò Huế mang đến hương vị đặc trưng của xứ Huế với nước dùng màu đỏ quyến rũ, hòa quyện tinh tế giữa vị sả và ruốc thơm nồng. Sự kết hợp hoàn hảo giữa thịt bò bắp mềm, khoanh giò, huyết, chả lụa tạo nên một trải nghiệm ẩm thực đậm đà và phong phú.">
                        </textarea>
                    </div>
                </div>

                <div className={style.containerFoodandImg}>
                    <div className={style.titleInput}>Khẩu phần:</div>
                    <input type="text" className={style.inputBox2} placeholder="2 người" />
                    <div className={style.titleInput}>Thời gian nấu:</div>
                    <input type="text" className={style.inputBox2} placeholder="120 phút" />
                </div>

                <div className={style.titleContainer2}>Nguyên liệu</div>
                <textarea className={style.textAreaBox2} placeholder="Chân giò heo 1 kg
Nạm bò 500 gr
Bún sợi to 200 gr
Dầu màu điều 3 muỗng canh
Sả 7 cây
Hành tây 2 củ
Tỏi, gừng 1 củ
Mắm ruốc 2 muỗng canh
Hành lá, giá đỗ, hoa chuối, mùi tàu/húng quế
Chanh 1 trái"></textarea>
                <div className={style.titleContainer2}>Cách chế biến</div>
                <textarea className={style.textAreaBox2} placeholder="Bước 1: Chân giò chặt khoanh, luộc sơ, rửa sạch. Nạm bò luộc với gừng, ninh nhỏ lửa 2 tiếng, thái mỏng.
Bước 2: Huyết luộc chín, cắt miếng. Chả cua vo viên, luộc chín. Sả băm và đập dập, hành tây cắt đôi và thái mỏng, rau thơm rửa sạch.
Bước 3: Phi sả, tỏi, ớt, hành với dầu điều. Ninh chân giò với sả, hành tây. Thêm nước mắm ruốc, đường, hạt nêm, muối, sa tế, nêm vừa ăn.
Bước 4: Trụng bún, cho thịt, giò, chả, huyết, rau thơm, hành tây rồi chan nước dùng. Ăn kèm hoa chuối, giá, rau thơm, ớt chưng."></textarea>
                <button className={style.addButton}>Thêm món ăn</button>
            </div>
            
        </div>
    );
};

export default AddFoodPage;
