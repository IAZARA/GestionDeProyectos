import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Row, Col, Badge, Table, Spinner, Button } from 'react-bootstrap';
import { 
  FaUsers, FaCalendarAlt, FaFileAlt, FaChartLine, 
  FaExclamationTriangle, FaCheckCircle, FaClock, FaArrowUp, 
  FaArrowDown, FaDownload
} from 'react-icons/fa';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const DashboardContainer = styled.div`
  margin-bottom: 2rem;
`;

const StyledCard = styled(Card)`
  height: 100%;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
  color: #5c6bc0;
`;

const StatNumber = styled.h2`
  color: #1a237e;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.p`
  color: #757575;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.span`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: ${props => props.positive ? '#4caf50' : '#f44336'};
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

// Datos simulados para el dashboard
const userStats = {
  total: 125,
  active: 98,
  inactive: 27,
  change: 12,
  changePositive: true
};

const licenseStats = {
  total: 45,
  pending: 8,
  approved: 32,
  rejected: 5,
  change: -3,
  changePositive: false
};

const documentStats = {
  total: 328,
  thisMonth: 42,
  change: 15,
  changePositive: true
};

const projectStats = {
  total: 24,
  active: 18,
  completed: 6,
  change: 2,
  changePositive: true
};

// Datos simulados para gráficos
const userActivityData = [
  { name: 'Ene', activos: 85, inactivos: 25 },
  { name: 'Feb', activos: 88, inactivos: 24 },
  { name: 'Mar', activos: 90, inactivos: 26 },
  { name: 'Abr', activos: 92, inactivos: 25 },
  { name: 'May', activos: 95, inactivos: 26 },
  { name: 'Jun', activos: 98, inactivos: 27 }
];

const licenseStatusData = [
  { name: 'Aprobadas', value: 32, color: '#4caf50' },
  { name: 'Pendientes', value: 8, color: '#ff9800' },
  { name: 'Rechazadas', value: 5, color: '#f44336' }
];

const departmentDistributionData = [
  { name: 'Tecnología', value: 35 },
  { name: 'Recursos Humanos', value: 15 },
  { name: 'Finanzas', value: 20 },
  { name: 'Marketing', value: 18 },
  { name: 'Ventas', value: 25 },
  { name: 'Operaciones', value: 12 }
];

const documentActivityData = [
  { name: 'Ene', documentos: 25 },
  { name: 'Feb', documentos: 32 },
  { name: 'Mar', documentos: 28 },
  { name: 'Abr', documentos: 35 },
  { name: 'May', documentos: 38 },
  { name: 'Jun', documentos: 42 }
];

// Datos simulados para licencias pendientes
const pendingLicenses = [
  {
    id: '1',
    employee: 'María González',
    department: 'Recursos Humanos',
    type: 'Licencia por Maternidad',
    startDate: '2023-11-01',
    endDate: '2024-02-01',
    requestDate: '2023-10-15'
  },
  {
    id: '2',
    employee: 'Carlos Rodríguez',
    department: 'Finanzas',
    type: 'Vacaciones',
    startDate: '2023-11-20',
    endDate: '2023-12-04',
    requestDate: '2023-10-25'
  },
  {
    id: '3',
    employee: 'Ana Martínez',
    department: 'Marketing',
    type: 'Día Personal',
    startDate: '2023-11-10',
    endDate: '2023-11-10',
    requestDate: '2023-10-30'
  }
];

// Datos simulados para nuevos usuarios
const recentUsers = [
  {
    id: '1',
    name: 'Lucía Fernández',
    department: 'Ventas',
    role: 'Ejecutiva',
    joinDate: '2023-10-28'
  },
  {
    id: '2',
    name: 'Martín López',
    department: 'Tecnología',
    role: 'Desarrollador',
    joinDate: '2023-10-25'
  },
  {
    id: '3',
    name: 'Sofía García',
    department: 'Marketing',
    role: 'Diseñadora',
    joinDate: '2023-10-20'
  }
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }
  
  return (
    <DashboardContainer>
      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaUsers /></IconWrapper>
                Usuarios
              </Card.Title>
              <StatNumber>{userStats.total}</StatNumber>
              <StatLabel>{userStats.active} activos, {userStats.inactive} inactivos</StatLabel>
              <StatChange positive={userStats.changePositive}>
                {userStats.changePositive ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                {userStats.change} desde el mes pasado
              </StatChange>
            </Card.Body>
          </StyledCard>
        </Col>
        
        <Col md={3}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaCalendarAlt /></IconWrapper>
                Licencias
              </Card.Title>
              <StatNumber>{licenseStats.total}</StatNumber>
              <StatLabel>
                <span className="text-success">{licenseStats.approved} aprobadas</span>, 
                <span className="text-warning ms-1">{licenseStats.pending} pendientes</span>
              </StatLabel>
              <StatChange positive={licenseStats.changePositive}>
                {licenseStats.changePositive ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                {Math.abs(licenseStats.change)} desde el mes pasado
              </StatChange>
            </Card.Body>
          </StyledCard>
        </Col>
        
        <Col md={3}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaFileAlt /></IconWrapper>
                Documentos
              </Card.Title>
              <StatNumber>{documentStats.total}</StatNumber>
              <StatLabel>{documentStats.thisMonth} nuevos este mes</StatLabel>
              <StatChange positive={documentStats.changePositive}>
                {documentStats.changePositive ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                {documentStats.change}% desde el mes pasado
              </StatChange>
            </Card.Body>
          </StyledCard>
        </Col>
        
        <Col md={3}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaChartLine /></IconWrapper>
                Proyectos
              </Card.Title>
              <StatNumber>{projectStats.total}</StatNumber>
              <StatLabel>
                <span className="text-primary">{projectStats.active} activos</span>, 
                <span className="text-success ms-1">{projectStats.completed} completados</span>
              </StatLabel>
              <StatChange positive={projectStats.changePositive}>
                {projectStats.changePositive ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                {projectStats.change} nuevos este mes
              </StatChange>
            </Card.Body>
          </StyledCard>
        </Col>
      </Row>
      
      {/* Gráficos */}
      <Row className="mb-4">
        <Col md={8}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaUsers /></IconWrapper>
                Actividad de Usuarios
              </Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={userActivityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activos" stackId="a" fill="#3f51b5" name="Usuarios Activos" />
                  <Bar dataKey="inactivos" stackId="a" fill="#e0e0e0" name="Usuarios Inactivos" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </StyledCard>
        </Col>
        
        <Col md={4}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaCalendarAlt /></IconWrapper>
                Estado de Licencias
              </Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={licenseStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {licenseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </StyledCard>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaFileAlt /></IconWrapper>
                Actividad de Documentos
              </Card.Title>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={documentActivityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="documentos" stroke="#3f51b5" activeDot={{ r: 8 }} name="Documentos Subidos" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </StyledCard>
        </Col>
        
        <Col md={6}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaUsers /></IconWrapper>
                Distribución por Departamento
              </Card.Title>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={departmentDistributionData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3f51b5" name="Empleados" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </StyledCard>
        </Col>
      </Row>
      
      {/* Tablas de información */}
      <Row>
        <Col md={6}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaExclamationTriangle /></IconWrapper>
                Licencias Pendientes de Aprobación
              </Card.Title>
              <StyledTable responsive>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Tipo</th>
                    <th>Período</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLicenses.map(license => (
                    <tr key={license.id}>
                      <td>{license.employee}</td>
                      <td>{license.type}</td>
                      <td>
                        {license.startDate} al {license.endDate}
                      </td>
                      <td>
                        <StyledBadge bg="warning">
                          <FaClock className="me-1" /> Pendiente
                        </StyledBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
              {pendingLicenses.length > 0 && (
                <div className="text-end mt-2">
                  <Button variant="outline-primary" size="sm">
                    Ver todas las licencias
                  </Button>
                </div>
              )}
            </Card.Body>
          </StyledCard>
        </Col>
        
        <Col md={6}>
          <StyledCard>
            <Card.Body>
              <Card.Title>
                <IconWrapper><FaUsers /></IconWrapper>
                Usuarios Recientes
              </Card.Title>
              <StyledTable responsive>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Departamento</th>
                    <th>Rol</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.department}</td>
                      <td>{user.role}</td>
                      <td>{user.joinDate}</td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
              {recentUsers.length > 0 && (
                <div className="text-end mt-2">
                  <Button variant="outline-primary" size="sm">
                    Ver todos los usuarios
                  </Button>
                </div>
              )}
            </Card.Body>
          </StyledCard>
        </Col>
      </Row>
      
      {/* Acciones rápidas */}
      <Row className="mt-4">
        <Col>
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" className="me-2">
              <FaDownload className="me-1" /> Exportar Informes
            </Button>
            <Button variant="primary">
              <FaCheckCircle className="me-1" /> Revisar Licencias Pendientes
            </Button>
          </div>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default AdminDashboard;
