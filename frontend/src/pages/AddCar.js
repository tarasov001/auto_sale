import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AddCar() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    description: '',
    phone: '',
  });
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdCar, setCreatedCar] = useState(null);
  const navigate = useNavigate();

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Создаем превью первого изображения
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Создаем FormData для отправки с файлами
      const formDataToSend = new FormData();
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('mileage', formData.mileage || 0);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('phone', formData.phone);
      
      // Добавляем фото
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Создаем автомобиль с фото
      const { data: car } = await api.post('/cars/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Сохраняем данные созданного авто для превью
      setCreatedCar(car);

      // Показываем окно успеха
      setSuccess(true);
    } catch (err) {
      console.error('Ошибка:', err);
      console.error('Ответ:', err.response?.data);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Ошибка при создании объявления' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    navigate('/cabinet');
  };

  const handleEdit = () => {
    setSuccess(false);
    setCreatedCar(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 1950; y--) {
    yearOptions.push(y);
  }

  // Окно успеха
  if (success && createdCar) {
    const imageUrl = createdCar.image || (createdCar.images && createdCar.images[0] && createdCar.images[0].image);
    
    return (
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-success">
            <div className="card-header bg-success text-white text-center">
              <h2 className="mb-0">✅ Объявление успешно создано!</h2>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`${createdCar.brand} ${createdCar.model}`}
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-secondary d-flex align-items-center justify-content-center rounded"
                    style={{ height: '300px' }}
                  >
                    <span className="text-white fs-4">Нет фото</span>
                  </div>
                )}
              </div>
              
              <h3 className="mb-3">
                {createdCar.brand} {createdCar.model}
              </h3>
              
              <div className="row mb-3">
                <div className="col-6">
                  <p className="mb-1 text-muted">Год</p>
                  <p className="fs-5 fw-bold">{createdCar.year}</p>
                </div>
                <div className="col-6">
                  <p className="mb-1 text-muted">Пробег</p>
                  <p className="fs-5 fw-bold">{createdCar.mileage} км</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="mb-1 text-muted">Цена</p>
                <p className="fs-3 fw-bold text-primary">
                  {formatPrice(createdCar.price)} ₽
                </p>
              </div>
              
              <div className="d-grid gap-2">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleOk}
                >
                  ✓ Ок, понятно
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleEdit}
                >
                  ✎ Редактировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Форма создания
  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Добавить автомобиль</h4>
          </div>
          <div className="card-body">
            {errors.general && (
              <div className="alert alert-danger">{errors.general}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Марка *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />
                  {errors.brand && (
                    <div className="text-danger small">{errors.brand}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Модель *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                  />
                  {errors.model && (
                    <div className="text-danger small">{errors.model}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Год выпуска *</label>
                  <select
                    className="form-select"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {errors.year && (
                    <div className="text-danger small">{errors.year}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Цена (₽) *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  {errors.price && (
                    <div className="text-danger small">{errors.price}</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Пробег (км)</label>
                <input
                  type="number"
                  className="form-control"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  defaultValue="0"
                />
                {errors.mileage && (
                  <div className="text-danger small">{errors.mileage}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Телефон *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 000-00-00"
                  required
                />
                {errors.phone && (
                  <div className="text-danger small">{errors.phone}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Описание</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Опишите состояние, комплектацию и другие детали"
                />
                {errors.description && (
                  <div className="text-danger small">{errors.description}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Фотографии</label>
                <input
                  type="file"
                  className="form-control"
                  name="images"
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                />
                <div className="form-text">
                  Можно выбрать несколько файлов
                </div>
                {previewImage && (
                  <div className="mt-2">
                    <img
                      src={previewImage}
                      alt="Превью"
                      className="rounded"
                      style={{ width: '100px', height: '75px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Добавить объявление'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCar;
