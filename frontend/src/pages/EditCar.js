import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function EditCar() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    description: '',
    phone: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    try {
      const { data } = await api.get(`/cars/${id}/`);
      setFormData({
        brand: data.brand,
        model: data.model,
        year: data.year,
        price: data.price,
        mileage: data.mileage,
        description: data.description || '',
        phone: data.phone,
      });
      setExistingImages(data.images || []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Не удалось загрузить данные автомобиля');
      navigate('/cabinet');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Удалить это фото?')) return;
    try {
      await api.delete(`/car-images/${imageId}/`);
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error('Ошибка удаления фото:', error);
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
      
      // Добавляем новые фото
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Обновляем автомобиль
      await api.patch(`/cars/${id}/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/cabinet');
    } catch (err) {
      console.error('Ошибка:', err);
      console.error('Ответ:', err.response?.data);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Ошибка при сохранении' });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 1950; y--) {
    yearOptions.push(y);
  }

  if (fetching) {
    return <div className="text-center">Загрузка...</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Редактировать объявление</h4>
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
                />
                {errors.description && (
                  <div className="text-danger small">{errors.description}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Текущие фотографии</label>
                {existingImages.length > 0 ? (
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="position-relative">
                        <img
                          src={img.image}
                          alt="Фото"
                          style={{ width: '100px', height: '75px', objectFit: 'cover' }}
                          className="rounded"
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle"
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">Нет фотографий</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Добавить фотографии</label>
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
                {images.length > 0 && (
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    {images.map((file, idx) => (
                      <div key={idx} className="position-relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Фото ${idx + 1}`}
                          className="rounded"
                          style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                        />
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCar;
