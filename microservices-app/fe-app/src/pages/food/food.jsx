import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import style from "./food.module.css";
import styleBar from "../../components/bar.module.css";

import logo from "/logo.png";
import corner from "/corner.png";
import temp from "/temp.jpg";

import { getRecipebyId } from "../../services/recipe";

const FoodPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initPage = async () => {
      const token =
        location.state?.token || localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const storedUserStr = localStorage.getItem("user");
      const userData =
        location.state?.user ||
        (storedUserStr ? JSON.parse(storedUserStr) : null);

      if (!userData) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(userData);

      try {
        setLoading(true);
        const data = await getRecipebyId(id, token);
        setRecipe(data);
      } catch (err) {
        console.error("Fetch recipe failed:", err);
        setError(err.message || "Không thể tải công thức");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [id, location.state, navigate]);

  if (loading) return <div className={style.background}>Loading...</div>;
  if (error) return <div className={style.background}>{error}</div>;
  if (!recipe) return <div className={style.background}>Không tìm thấy công thức</div>;

 
  return (
    <div className={style.background}>
      <div className={styleBar.top}>
        <div className={styleBar.bar}>
          <img
            src={logo}
            alt="Logo"
            className={styleBar.logo}
            onClick={() => navigate("/")}
          />

          <div className={styleBar.textbar}>
            Chào mừng, {user?.username}
          </div>

          <div className={styleBar.avatarcontainer}>
            <img
              src={user?.avatar || temp}
              alt="Avatar"
              className={styleBar.avatar}
            />
          </div>
        </div>

        <div className={style.imgcontainer}>
          <img
            src={recipe.image || corner}
            alt={recipe.title}
            className={style.imgfood}
          />
        </div>

        <div className={style.title}>{recipe.title}</div>

   
        <div
          className={style.description}
          dangerouslySetInnerHTML={{ __html: recipe.summary }}
        />

        <div className={style.nutrition}>
          <div className={style.nutritionitem}>
            <span>Khẩu phần:</span>
            <span className={style.nutritionitemvalue}>
              {recipe.servings} người
            </span>
          </div>

          <div className={style.nutritionitem}>
            <span>Thời gian:</span>
            <span className={style.nutritionitemvalue}>
              {recipe.ready_in_minutes}'
            </span>
          </div>
        </div>
      </div>

      <div className={style.bottomSpace}>

        <div className={style.titleIngredients}>Nguyên liệu</div>
        <div className={style.ingredientsList}>
          <ul>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((item) => (
                <li key={item.id}>
                  {item.name} – {item.amount} {item.unit}
                </li>
              ))
            ) : (
              <li>Không có nguyên liệu</li>
            )}
          </ul>
        </div>

        {/* STEPS */}
        <div className={style.titleSteps}>Các bước thực hiện</div>
        <div className={style.steps}>
          {recipe.instructions || "Chưa có hướng dẫn"}
        </div>
      </div>
    </div>
  );
};

export default FoodPage;
