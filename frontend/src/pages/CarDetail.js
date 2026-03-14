import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    try {
      const { data } = await api.get(`/cars/${id}/`);
      setCar(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (!car) {
    return <div className="alert alert-danger">Автомобиль не найден</div>;
  }

  const allImages = car.images?.length > 0 ? car.images.map(img => img.image) : [];

  return (
    <div>
      <Link to="/" className="btn btn-outline-secondary mb-3">
        ← Назад к списку
      </Link>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            {allImages.length > 0 ? (
              <>
                <img
                  src={allImages[currentImageIndex]}
                  className="card-img-top"
                  alt={`${car.brand} ${car.model}`}
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
                {allImages.length > 1 && (
                  <div className="d-flex gap-2 p-2 overflow-auto">
                    {allImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Фото ${idx + 1}`}
                        className={`thumbnail ${idx === currentImageIndex ? 'border-primary' : ''}`}
                        style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                style={{ height: '300px' }}
              >
                <span className="text-white">Нет фото</span>
              </div>
            )}
            <div className="card-body">
              <h1 className="card-title">
                {car.brand} {car.model}
              </h1>
              <h2 className="text-primary mb-3">
                {formatPrice(car.price)} ₽
              </h2>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Год выпуска</th>
                    <td>{car.year}</td>
                  </tr>
                  <tr>
                    <th>Пробег</th>
                    <td>{car.mileage} км</td>
                  </tr>
                  <tr>
                    <th>Описание</th>
                    <td>{car.description || 'Не указано'}</td>
                  </tr>
                  <tr>
                    <th>Дата размещения</th>
                    <td>{formatDate(car.created_at)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              Контакты продавца
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Продавец:</strong> {car.owner_username}
              </p>
              <p className="mb-3">
                <strong>Телефон:</strong>{' '}
                <a href={`tel:${car.phone}`} className="text-decoration-none">
                  {car.phone}
                </a>
              </p>
              <a href={`tel:${car.phone}`} className="btn btn-success w-100 mb-2">
                Позвонить
              </a>
              <a
                href={`https://wa.me/${car.phone.replace(/[^0-9]/g, '')}`}
                className="btn btn-success w-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;
