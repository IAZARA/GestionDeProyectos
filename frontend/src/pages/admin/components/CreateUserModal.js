import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import FormControl from '../../../components/common/FormControl';

const CreateUserModal = ({ isOpen, onClose, onCreateUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    expertiseArea: 'technical',
    department: '',
    position: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const mappedData = {
        ...formData,
        password: 'Minseg2025-', // Contraseña por defecto
        isActive: true // Asegurar que el usuario esté activo
      };

      await onCreateUser(mappedData);
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        expertiseArea: 'technical',
        department: '',
        position: ''
      });
    } catch (err) {
      setError('Error al crear el usuario. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header onClose={onClose}>
        Crear Nuevo Usuario
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormControl.Input
              label="Nombre"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Ingrese el nombre"
            />

            <FormControl.Input
              label="Apellido"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Ingrese el apellido"
            />

            <FormControl.Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Ingrese el email"
            />

            <FormControl.Select
              label="Rol"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">Usuario</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </FormControl.Select>

            <FormControl.Select
              label="Área de Expertise"
              name="expertiseArea"
              value={formData.expertiseArea}
              onChange={handleChange}
              required
            >
              <option value="administrative">Administrativa</option>
              <option value="technical">Técnica</option>
              <option value="legal">Legal</option>
            </FormControl.Select>

            <FormControl.Input
              label="Departamento"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="Ingrese el departamento"
            />

            <FormControl.Input
              label="Posición"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              placeholder="Ingrese la posición"
            />

            {error && (
              <div style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {error}
              </div>
            )}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} loading={loading}>
          Crear Usuario
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateUserModal;
