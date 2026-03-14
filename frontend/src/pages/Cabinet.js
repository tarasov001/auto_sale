import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Cabinet() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const { data } = await api.get('/cars/my/');
      setCars(data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }
    try {
      await api.delete(`/cars/${id}/`);
      setCars(cars.filter((car) => car.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить объявление');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Личный кабинет</h1>
        <Link to="/add-car" className="btn btn-primary">
          + Добавить автомобиль
        </Link>
      </div>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : cars.length === 0 ? (
        <div className="alert alert-info">
          У вас пока нет объявлений.{' '}
          <Link to="/add-car">Добавьте первое!</Link>
        </div>
      ) : (
        <div className="row">
          {cars.map((car) => (
            <div key={car.id} className="col-md-4 mb-4">
              <div className="card h-100">
                {car.images && car.images.length > 0 ? (
                  <img
                    src={car.images[0].image}
                    className="card-img-top"
                    alt={`${car.brand} ${car.model}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                    style={{ height: '200px' }}
                  >
                    <span className="text-white">Нет фото</span>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title">
                    {car.brand} {car.model}
                  </h5>
                  <p className="card-text">
                    <strong>{formatPrice(car.price)} ₽</strong>
                  </p>
                  <p className="card-text text-muted">
                    {car.year} год • {car.mileage} км
                  </p>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/edit-car/${car.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cabinet;
