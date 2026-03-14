import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CarDetail from './pages/CarDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cabinet from './pages/Cabinet';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      // Можно загрузить данные пользователя
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">AutoSale</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Все авто</Link>
                </li>
                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/cabinet">Личный кабинет</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/add-car">Добавить авто</Link>
                    </li>
                    <li className="nav-item">
                      <button className="nav-link btn btn-link" onClick={handleLogout}>
                        Выйти
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">Вход</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">Регистрация</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/login" element={<Login onLogin={setIsAuthenticated} />} />
            <Route path="/register" element={<Register onRegister={setIsAuthenticated} />} />
            <Route path="/cabinet" element={<Cabinet />} />
            <Route path="/add-car" element={<AddCar />} />
            <Route path="/edit-car/:id" element={<EditCar />} />
          </Routes>
        </main>

        <footer className="bg-light text-center text-lg-start mt-5">
          <div className="container p-4">
            <div className="text-center p-3 bg-dark text-white">
              © 2026 AutoSale - Бесплатная продажа автомобилей
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
