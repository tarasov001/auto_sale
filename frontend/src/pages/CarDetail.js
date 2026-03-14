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

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (!car) {
    return <div className="alert alert-danger">Автомобиль не найден</div>;
  }

  const allImages = car.images?.length > 0 ? car.images.map(img => img.image) : [];
  const hasMultipleImages = allImages.length > 1;

  return (
    <div>
      <Link to="/" className="btn btn-outline-secondary mb-3">
        ← Назад к списку
      </Link>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            {allImages.length > 0 ? (
              <>
                <div className="position-relative">
                  <img
                    src={allImages[currentImageIndex]}
                    className="card-img-top"
                    alt={`${car.brand} ${car.model}`}
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                  />
                  
                  {/* Кнопки навигации */}
                  {hasMultipleImages && (
                    <>
                      <button
                        className="btn btn-dark position-absolute top-50 start-0 translate-middle-y rounded-circle"
                        onClick={prevImage}
                        style={{ width: '40px', height: '40px', opacity: 0.7 }}
                      >
                        ‹
                      </button>
                      <button
                        className="btn btn-dark position-absolute top-50 end-0 translate-middle-y rounded-circle"
                        onClick={nextImage}
                        style={{ width: '40px', height: '40px', opacity: 0.7 }}
                      >
                        ›
                      </button>
                      <span className="position-absolute top-0 end-0 bg-dark text-white px-2 py-1 m-2 rounded small">
                        {currentImageIndex + 1} / {allImages.length}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Миниатюры */}
                {hasMultipleImages && (
                  <div className="card-body border-top">
                    <div className="d-flex gap-2 overflow-auto">
                      {allImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 position-relative ${
                            idx === currentImageIndex ? 'border border-primary border-2' : 'border'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <img
                            src={img}
                            alt={`Фото ${idx + 1}`}
                            style={{ width: '100px', height: '75px', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
                style={{ height: '400px' }}
              >
                <span className="text-white">Нет фото</span>
              </div>
            )}
            
            <div className="card-body">
              <h1 className="card-title mb-3">
                {car.brand} {car.model}
              </h1>
              <h2 className="text-primary mb-3">
                {formatPrice(car.price)} ₽
              </h2>
              
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded text-center">
                    <small className="text-muted d-block">Год выпуска</small>
                    <strong className="fs-5">{car.year}</strong>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded text-center">
                    <small className="text-muted d-block">Пробег</small>
                    <strong className="fs-5">{car.mileage} км</strong>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded text-center">
                    <small className="text-muted d-block">Дата размещения</small>
                    <strong className="fs-6">{formatDate(car.created_at)}</strong>
                  </div>
                </div>
              </div>
              
              {car.description && (
                <div>
                  <h5 className="mb-2">Описание</h5>
                  <p className="card-text">{car.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              Контакты продавца
            </div>
            <div className="card-body">
              <p className="mb-2">
                <strong>Продавец:</strong> {car.owner_username}
              </p>
              <p className="mb-3">
                <strong>Телефон:</strong>{' '}
                <a href={`tel:${car.phone}`} className="text-decoration-none fs-5">
                  {car.phone}
                </a>
              </p>
              <a href={`tel:${car.phone}`} className="btn btn-success w-100 mb-2 btn-lg">
                📞 Позвонить
              </a>
              <a
                href={`https://wa.me/${car.phone.replace(/[^0-9]/g, '')}`}
                className="btn btn-success w-100 mb-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp
              </a>
              <a
                href={`https://t.me/+${car.phone.replace(/[^0-9]/g, '')}`}
                className="btn btn-outline-primary w-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                ✈️ Telegram
              </a>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header bg-info text-white">
              Информация
            </div>
            <div className="card-body">
              <p className="mb-2 small">
                <strong>ID объявления:</strong> #{car.id}
              </p>
              <p className="mb-0 small">
                <strong>Просмотров:</strong> {car.views || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;
