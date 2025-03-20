import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { login } from '../../services/authService';

const FormContainer = styled.div`
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const InputField = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #303f9f;
    box-shadow: 0 0 0 2px rgba(48, 63, 159, 0.2);
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #303f9f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1a237e;
  }
  
  &:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
  }
`;

const AlertMessage = styled.div`
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background-color: ${props => props.$success ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.$success ? '#2e7d32' : '#d32f2f'};
  border-radius: 4px;
  font-size: 0.9rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: #333;
`;

const Checkbox = styled(Field)`
  margin-right: 0.5rem;
  cursor: pointer;
`;

// Esquema de validación con Yup
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es requerido'),
  password: Yup.string()
    .required('La contraseña es requerida'),
  rememberMe: Yup.boolean()
});

const LoginForm = () => {
  const [alert, setAlert] = useState({ show: false, message: '', success: false });
  const navigate = useNavigate();
  
  // Intentar recuperar el último email usado
  const [initialEmail, setInitialEmail] = useState('');
  
  useEffect(() => {
    const lastUser = localStorage.getItem('lastUser');
    if (lastUser) {
      try {
        const userData = JSON.parse(lastUser);
        if (userData && userData.email) {
          setInitialEmail(userData.email);
          console.log('Email recuperado de sesión anterior:', userData.email);
        }
      } catch (e) {
        console.error('Error al parsear datos de usuario guardados:', e);
      }
    }
  }, []);
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('Iniciando sesión con datos:', {
        email: values.email,
        rememberMe: values.rememberMe
      });
      
      await login(values.email, values.password, values.rememberMe);
      
      // Verificar explícitamente que el token se guardó correctamente
      const token = values.rememberMe 
        ? localStorage.getItem('token') 
        : sessionStorage.getItem('token');
        
      if (!token) {
        console.error('El token no se guardó correctamente después del login');
        setAlert({
          show: true,
          message: 'Error al guardar la sesión. Por favor, intente nuevamente.',
          success: false
        });
        setSubmitting(false);
        return;
      }
      
      setAlert({
        show: true,
        message: 'Inicio de sesión exitoso. Redirigiendo...',
        success: true
      });
      
      // Recargar la página para garantizar que los tokens se apliquen correctamente
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error) {
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Error al iniciar sesión',
        success: false
      });
      setSubmitting(false);
    }
  };
  
  return (
    <FormContainer>
      {alert.show && (
        <AlertMessage $success={alert.success}>
          {alert.message}
        </AlertMessage>
      )}
      
      <Formik
        initialValues={{ 
          email: initialEmail, 
          password: '', 
          rememberMe: true  // Por defecto activado para mejor UX
        }}
        validationSchema={loginSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <FormGroup>
              <Label htmlFor="email">Correo electrónico</Label>
              <InputField
                type="email"
                id="email"
                name="email"
                placeholder="Correo electrónico"
                className={errors.email && touched.email ? 'error' : ''}
              />
              <ErrorMessage name="email" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Contraseña</Label>
              <InputField
                type="password"
                id="password"
                name="password"
                placeholder="Contraseña"
                className={errors.password && touched.password ? 'error' : ''}
              />
              <ErrorMessage name="password" component={ErrorText} />
            </FormGroup>
            
            <CheckboxContainer>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                />
                Recordarme
              </CheckboxLabel>
            </CheckboxContainer>
            
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </SubmitButton>
          </Form>
        )}
      </Formik>
    </FormContainer>
  );
};

export default LoginForm;