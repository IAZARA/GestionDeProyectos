import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Table, Form, Button, Card, Row, Col, InputGroup, Badge, Tabs, Tab, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaFilter, FaHistory, FaFileExport, FaCalendarAlt } from 'react-icons/fa';

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const TableContainer = styled.div`
  margin-top: 1rem;
  overflow-x: auto;
`;

const StyledTable = styled(Table)`
  font-size: 0.9rem;
  
  th {
    background-color: #e8eaf6;
    color: #3949ab;
    font-weight: 600;
  }
  
  td {
    vertical-align: middle;
  }
`;

const StyledBadge = styled(Badge)`
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 0.25rem;
`;

const ActionButton = styled(Button)`
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
`;

const TabContent = styled.div`
  padding: 1.5rem 0;
`;

const FormLabel = styled(Form.Label)`
  font-weight: 600;
  color: #3949ab;
`;

// Datos simulados para empleados
const mockEmployees = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@empresa.com',
    department: 'Tecnología',
    role: 'Desarrollador Senior',
    expertise: ['Frontend', 'React', 'UX/UI'],
    status: 'Activo',
    hireDate: '2022-03-10',
    documentId: '30123456',
    phone: '+54 11 1234-5678',
    location: 'Sede Central'
  },
  {
    id: '2',
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@empresa.com',
    department: 'Recursos Humanos',
    role: 'Gerente',
    expertise: ['Administrativo', 'Gestión de Personal'],
    status: 'Activo',
    hireDate: '2020-05-15',
    documentId: '28765432',
    phone: '+54 11 8765-4321',
    location: 'Sede Norte'
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@empresa.com',
    department: 'Finanzas',
    role: 'Analista',
    expertise: ['Contabilidad', 'Administrativo'],
    status: 'Activo',
    hireDate: '2021-08-22',
    documentId: '29876543',
    phone: '+54 11 5678-1234',
    location: 'Sede Central'
  },
  {
    id: '4',
    firstName: 'Laura',
    lastName: 'Martínez',
    email: 'laura.martinez@empresa.com',
    department: 'Marketing',
    role: 'Diseñadora',
    expertise: ['Diseño Gráfico', 'Redes Sociales'],
    status: 'Licencia',
    hireDate: '2023-01-10',
    documentId: '31234567',
    phone: '+54 11 4321-8765',
    location: 'Sede Sur'
  },
  {
    id: '5',
    firstName: 'Roberto',
    lastName: 'López',
    email: 'roberto.lopez@empresa.com',
    department: 'Ventas',
    role: 'Ejecutivo',
    expertise: ['Negociación', 'Atención al Cliente'],
    status: 'Inactivo',
    hireDate: '2019-11-05',
    documentId: '27654321',
    phone: '+54 11 2345-6789',
    location: 'Sede Norte'
  }
];

// Datos simulados para departamentos
const departments = ['Todos', 'Tecnología', 'Recursos Humanos', 'Finanzas', 'Marketing', 'Ventas', 'Operaciones'];

// Datos simulados para roles
const roles = ['Todos', 'Desarrollador', 'Gerente', 'Analista', 'Diseñador', 'Ejecutivo', 'Administrativo'];

// Datos simulados para expertise
const expertiseOptions = ['Frontend', 'Backend', 'UX/UI', 'Administrativo', 'Gestión de Personal', 'Contabilidad', 'Diseño Gráfico', 'Redes Sociales', 'Negociación', 'Atención al Cliente'];

// Datos simulados para estados
const statuses = ['Todos', 'Activo', 'Licencia', 'Inactivo'];

const StaffManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: 'Todos',
    role: 'Todos',
    expertise: 'Todos',
    status: 'Todos'
  });
  
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: '',
    expertise: [],
    status: 'Activo',
    hireDate: '',
    documentId: '',
    phone: '',
    location: '',
    address: '',
    birthDate: '',
    bloodType: '',
    emergencyContact: ''
  });
  
  const [activeTab, setActiveTab] = useState('personal');
  
  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    setTimeout(() => {
      setEmployees(mockEmployees);
      setFilteredEmployees(mockEmployees);
      setLoading(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
    // Aplicar filtros y búsqueda
    let result = [...employees];
    
    // Aplicar término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(emp => 
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.documentId.includes(term)
      );
    }
    
    // Aplicar filtros
    if (filters.department !== 'Todos') {
      result = result.filter(emp => emp.department === filters.department);
    }
    
    if (filters.role !== 'Todos') {
      result = result.filter(emp => emp.role.includes(filters.role));
    }
    
    if (filters.expertise !== 'Todos') {
      result = result.filter(emp => emp.expertise.includes(filters.expertise));
    }
    
    if (filters.status !== 'Todos') {
      result = result.filter(emp => emp.status === filters.status);
    }
    
    setFilteredEmployees(result);
  }, [searchTerm, filters, employees]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      department: 'Todos',
      role: 'Todos',
      expertise: 'Todos',
      status: 'Todos'
    });
    setSearchTerm('');
  };
  
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      role: '',
      expertise: [],
      status: 'Activo',
      hireDate: '',
      documentId: '',
      phone: '',
      location: '',
      address: '',
      birthDate: '',
      bloodType: '',
      emergencyContact: ''
    });
    setShowEmployeeModal(true);
  };
  
  const openEditModal = (employee) => {
    setModalMode('edit');
    setCurrentEmployee(employee);
    setFormData({
      ...employee,
      expertise: employee.expertise || []
    });
    setShowEmployeeModal(true);
  };
  
  const openViewModal = (employee) => {
    setModalMode('view');
    setCurrentEmployee(employee);
    setFormData({
      ...employee,
      expertise: employee.expertise || []
    });
    setShowEmployeeModal(true);
  };
  
  const handleCloseModal = () => {
    setShowEmployeeModal(false);
    setCurrentEmployee(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleExpertiseChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      expertise: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simular guardado
    setLoading(true);
    
    setTimeout(() => {
      if (modalMode === 'add') {
        const newEmployee = {
          ...formData,
          id: (employees.length + 1).toString()
        };
        
        setEmployees(prev => [...prev, newEmployee]);
      } else if (modalMode === 'edit') {
        setEmployees(prev => 
          prev.map(emp => emp.id === currentEmployee.id ? { ...formData, id: emp.id } : emp)
        );
      }
      
      setLoading(false);
      handleCloseModal();
    }, 1000);
  };
  
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Activo':
        return <StyledBadge bg="success">Activo</StyledBadge>;
      case 'Licencia':
        return <StyledBadge bg="warning">Licencia</StyledBadge>;
      case 'Inactivo':
        return <StyledBadge bg="danger">Inactivo</StyledBadge>;
      default:
        return <StyledBadge bg="secondary">{status}</StyledBadge>;
    }
  };
  
  if (loading && employees.length === 0) {
    return <Spinner animation="border" variant="primary" />;
  }
  
  return (
    <div>
      <SearchContainer>
        <Row>
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar por nombre, email o documento..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="d-flex justify-content-end">
            <Button variant="outline-primary" className="me-2" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter className="me-1" /> Filtros
            </Button>
            <Button variant="primary" onClick={openAddModal}>
              <FaUserPlus className="me-1" /> Nuevo Empleado
            </Button>
          </Col>
        </Row>
        
        {showFilters && (
          <FilterSection>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Departamento</Form.Label>
                  <Form.Select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                  >
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                  >
                    {roles.map((role, index) => (
                      <option key={index} value={role}>{role}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Expertise</Form.Label>
                  <Form.Select
                    name="expertise"
                    value={filters.expertise}
                    onChange={handleFilterChange}
                  >
                    <option value="Todos">Todos</option>
                    {expertiseOptions.map((exp, index) => (
                      <option key={index} value={exp}>{exp}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    {statuses.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="outline-secondary" onClick={resetFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </FilterSection>
        )}
      </SearchContainer>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <strong>{filteredEmployees.length}</strong> empleados encontrados
        </div>
        <Button variant="outline-success">
          <FaFileExport className="me-1" /> Exportar
        </Button>
      </div>
      
      <TableContainer>
        <StyledTable striped hover responsive>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Departamento</th>
              <th>Cargo</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => (
              <tr key={employee.id}>
                <td>{employee.firstName} {employee.lastName}</td>
                <td>{employee.department}</td>
                <td>{employee.role}</td>
                <td>{employee.email}</td>
                <td>{getStatusBadge(employee.status)}</td>
                <td>
                  <ActionButton variant="outline-info" onClick={() => openViewModal(employee)}>
                    Ver
                  </ActionButton>
                  <ActionButton variant="outline-primary" onClick={() => openEditModal(employee)}>
                    <FaEdit />
                  </ActionButton>
                  <ActionButton variant="outline-danger" onClick={() => handleDelete(employee.id)}>
                    <FaTrash />
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
      
      {/* Modal para agregar/editar/ver empleado */}
      <Modal 
        show={showEmployeeModal} 
        onHide={handleCloseModal}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? 'Nuevo Empleado' : 
             modalMode === 'edit' ? 'Editar Empleado' : 
             'Detalles del Empleado'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab eventKey="personal" title="Información Personal">
                <TabContent>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Nombre</FormLabel>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Apellido</FormLabel>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Email</FormLabel>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Teléfono</FormLabel>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>DNI/CUIT</FormLabel>
                        <Form.Control
                          type="text"
                          name="documentId"
                          value={formData.documentId}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Form.Control
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Dirección</FormLabel>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Grupo Sanguíneo</FormLabel>
                        <Form.Control
                          type="text"
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Contacto de Emergencia</FormLabel>
                        <Form.Control
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </TabContent>
              </Tab>
              
              <Tab eventKey="work" title="Información Laboral">
                <TabContent>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Departamento</FormLabel>
                        <Form.Select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {departments.filter(d => d !== 'Todos').map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Cargo</FormLabel>
                        <Form.Control
                          type="text"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Fecha de Ingreso</FormLabel>
                        <Form.Control
                          type="date"
                          name="hireDate"
                          value={formData.hireDate}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <FormLabel>Ubicación</FormLabel>
                        <Form.Control
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Áreas de Expertise</FormLabel>
                    <Form.Select
                      multiple
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleExpertiseChange}
                      disabled={modalMode === 'view'}
                      style={{ height: '120px' }}
                    >
                      {expertiseOptions.map((exp, index) => (
                        <option key={index} value={exp}>{exp}</option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples opciones.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <FormLabel>Estado</FormLabel>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      required
                    >
                      {statuses.filter(s => s !== 'Todos').map((status, index) => (
                        <option key={index} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </TabContent>
              </Tab>
              
              <Tab eventKey="history" title="Historial Laboral">
                <TabContent>
                  <div className="text-center py-4">
                    <FaHistory size={40} className="mb-3 text-muted" />
                    <p className="text-muted">
                      {modalMode === 'add' 
                        ? 'El historial estará disponible después de crear el empleado.' 
                        : 'Historial de cambios y posiciones anteriores.'}
                    </p>
                  </div>
                </TabContent>
              </Tab>
              
              <Tab eventKey="licenses" title="Licencias">
                <TabContent>
                  <div className="text-center py-4">
                    <FaCalendarAlt size={40} className="mb-3 text-muted" />
                    <p className="text-muted">
                      {modalMode === 'add' 
                        ? 'La información de licencias estará disponible después de crear el empleado.' 
                        : 'Información detallada sobre licencias y ausencias.'}
                    </p>
                  </div>
                </TabContent>
              </Tab>
            </Tabs>
            
            {modalMode !== 'view' && (
              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    modalMode === 'add' ? 'Crear Empleado' : 'Guardar Cambios'
                  )}
                </Button>
              </div>
            )}
          </Form>
        </Modal.Body>
        {modalMode === 'view' && (
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={() => {
              setModalMode('edit');
            }}>
              Editar
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default StaffManagement;
