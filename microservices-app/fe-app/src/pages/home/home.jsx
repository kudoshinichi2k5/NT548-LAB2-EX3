import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import style from "./home.module.css";
import styleBar from "../../components/bar.module.css";
import logo from "/logo.png";
import corner from "/corner.png";
import temp from "/temp.jpg";

import {
  getRandomRecipe,
  searchByRecipe,
  searchByIngredient,
  getLikeRecipes,
} from "../../services/recipe";

import { updateAvatarApi } from "../../services/auth";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialized = useRef(false);

  const avatarRef = useRef(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [randomRecipe, setRandomRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [topLikedRecipes, setTopLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchRandomRecipe = useCallback(async (token) => {
    try {
      setLoading(true);
      const data = await getRandomRecipe(token);
      setRandomRecipe(data);
    } catch (err) {
      console.error("Fetch random recipe failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopLikedRecipes = useCallback(async (token) => {
    try {
      setLoading(true);
      const data = await getLikeRecipes(token);
      setTopLikedRecipes(data.slice(0, 12));
    } catch (err) {
      console.error("Fetch top liked recipes failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;

    const token =
      location.state?.token || localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    const userData = JSON.parse(storedUser);

    initialized.current = true;
    setUser(userData);

    fetchRandomRecipe(token);
    fetchTopLikedRecipes(token);

    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleChooseAvatar = () => {
    fileInputRef.current.click();
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await updateAvatarApi(file. token);

      const updatedUser = {
        ...user,
        avatar: res.avatar_url,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowMenu(false);
    } catch (err) {
      console.error("Update avatar failed:", err);
      alert("Đổi avatar thất bại");
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const recipeResults = await searchByRecipe(value, token);
      if (recipeResults?.length) {
        setSearchResults(recipeResults);
        return;
      }

      const ingredientResults = await searchByIngredient(value, token);
      setSearchResults(ingredientResults || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;


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
            Chào mừng, {user.username}
          </div>

          <div className={styleBar.avatarWrapper} ref={avatarRef}>
            <div className={styleBar.avatarcontainer}>
              <img
                src={user.avatar || temp}
                alt="Avatar"
                className={styleBar.avatar}
                onClick={() => setShowMenu((prev) => !prev)}
              />
            </div>

            {showMenu && (
              <div className={styleBar.avatarMenu}>
                <div
                  className={styleBar.menuItem}
                  onClick={handleChooseAvatar}
                >
                  Đổi avatar
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleUploadAvatar}
                />

                <div
                  className={styleBar.menuItem}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>

        <img src={corner} alt="" className={style.imgcorner} />

        <div className={style.imgcontainer}>
          <img
            src={randomRecipe?.image || temp}
            alt=""
            className={style.image}
          />
        </div>

        <div className={style.randomMeals}>
          <div className={style.titleRandomMeals}>Trưa nay ăn gì?</div>
          <div className={style.titlenamefood}>
            {randomRecipe?.title || "Đang tải..."}
          </div>
          <div className={style.descriptionRandomMeals}>
            {randomRecipe?.summary || "Đang tải..."}
          </div>
        </div>

        <input
          className={style.searchBar}
          placeholder="Tìm kiếm món ăn..."
          value={searchTerm}
          onChange={handleSearch}
        />

        {!searchTerm && topLikedRecipes.length > 0 && (
          <>
            <div className={style.titlefeat}>
              🔥 Món ăn được yêu thích nhất
            </div>

            <div className={style.featfoodcontainer}>
              {topLikedRecipes.map((r) => (
                <div
                  key={r._id}
                  className={style.eachfeatcontainer}
                  onClick={() => navigate(`/recipe/${r._id}`)}
                >
                  <img
                    src={r.image || temp}
                    alt=""
                    className={style.image}
                  />
                  <div className={style.featname}>{r.title}</div>
                  <div className={style.textlike}>
                    ❤️ {r.likes}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {loading && <div>Đang tải...</div>}
      </div>
    </div>
  );
};

export default Home;
