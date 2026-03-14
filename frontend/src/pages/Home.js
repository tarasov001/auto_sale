import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    min_price: '',
    max_price: '',
    min_year: '',
    max_year: '',
  });

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async (params = {}) => {
    try {
      setLoading(true);
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`/cars/${query ? '?' + query : ''}`);
      console.log('Полученные данные:', data); // Отладка
      setCars(data.results || data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    loadCars(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      brand: '',
      model: '',
      min_price: '',
      max_price: '',
      min_year: '',
      max_year: '',
    });
    loadCars();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div>
      <h1 className="mb-4">Все автомобили</h1>

      {/* Фильтры */}
      <form onSubmit={handleSearch} className="card card-body mb-4">
        <div className="row g-3">
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              name="brand"
              placeholder="Марка"
              value={filters.brand}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              name="model"
              placeholder="Модель"
              value={filters.model}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              name="min_price"
              placeholder="Цена от"
              value={filters.min_price}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              name="max_price"
              placeholder="Цена до"
              value={filters.max_price}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              name="min_year"
              placeholder="Год от"
              value={filters.min_year}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              name="max_year"
              placeholder="Год до"
              value={filters.max_year}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-12">
            <button type="submit" className="btn btn-primary me-2">
              Найти
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Сбросить
            </button>
          </div>
        </div>
      </form>

      {/* Список авто */}
      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : cars.length === 0 ? (
        <div className="alert alert-info">Автомобилей пока нет</div>
      ) : (
        <div className="row">
          {cars.map((car) => {
            const imageUrl = car.image;
            
            return (
            <div key={car.id} className="col-md-3 col-sm-6 mb-3">
              <div className="card h-100 shadow-sm">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    className="card-img-top"
                    alt={`${car.brand} ${car.model}`}
                    style={{ height: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height:150px"><span class="text-white-50 small">Нет фото</span></div>';
                    }}
                  />
                ) : (
                  <div
                    className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                    style={{ height: '150px' }}
                  >
                    <span className="text-white-50 small">Нет фото</span>
                  </div>
                )}
                <div className="card-body p-2">
                  <h6 className="card-title mb-1 text-truncate">
                    {car.brand} {car.model}
                  </h6>
                  <p className="card-text mb-1">
                    <strong className="text-primary">{formatPrice(car.price)} ₽</strong>
                  </p>
                  <p className="card-text small text-muted mb-1">
                    {car.year} г., {car.mileage} км
                  </p>
                  {car.description && (
                    <p className="card-text small text-muted mb-2 text-truncate" title={car.description}>
                      {car.description}
                    </p>
                  )}
                  <Link to={`/car/${car.id}`} className="btn btn-sm btn-primary w-100">
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

export default Home;
