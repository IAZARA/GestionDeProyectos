import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getDashboardStats, getActivityReport } from '../../services/admin.service';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  margin: 0 0 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const StatChange = styled.div`
  font-size: 0.75rem;
  margin-top: 0.5rem;
  color: ${props => props.positive ? '#10B981' : props.negative ? '#EF4444' : '#6B7280'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #E5E7EB;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityDate = styled.div`
  min-width: 100px;
  font-size: 0.75rem;
  color: #6B7280;
`;

const ActivityDescription = styled.div`
  font-size: 0.875rem;
  color: #4B5563;
`;

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(),
          getActivityReport({ limit: 10 })
        ]);
        
        setStats(statsData);
        setActivity(activityData.activities || []);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner fullPage />;
  }

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h2>No se pudieron cargar los datos</h2>
      </div>
    );
  }

  return (
    <div>
      <PageHeader>
        <PageTitle>Panel de Administración</PageTitle>
      </PageHeader>

      <StatisticsGrid>
        <StatCard>
          <StatTitle>Usuarios Totales</StatTitle>
          <StatValue>{stats.usuariosTotal}</StatValue>
          {stats.usuariosCambio && (
            <StatChange positive={stats.usuariosCambio > 0} negative={stats.usuariosCambio < 0}>
              {stats.usuariosCambio > 0 ? '+' : ''}{stats.usuariosCambio}% desde el mes pasado
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatTitle>Proyectos Activos</StatTitle>
          <StatValue>{stats.proyectosActivos}</StatValue>
          {stats.proyectosCambio && (
            <StatChange positive={stats.proyectosCambio > 0} negative={stats.proyectosCambio < 0}>
              {stats.proyectosCambio > 0 ? '+' : ''}{stats.proyectosCambio}% desde el mes pasado
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatTitle>Tareas Pendientes</StatTitle>
          <StatValue>{stats.tareasPendientes}</StatValue>
          {stats.tareasCambio && (
            <StatChange positive={stats.tareasCambio < 0} negative={stats.tareasCambio > 0}>
              {stats.tareasCambio > 0 ? '+' : ''}{stats.tareasCambio}% desde el mes pasado
            </StatChange>
          )}
        </StatCard>

        <StatCard>
          <StatTitle>Solicitudes de Permisos</StatTitle>
          <StatValue>{stats.permisosPendientes}</StatValue>
          {stats.permisosCambio && (
            <StatChange positive={stats.permisosCambio > 0} negative={stats.permisosCambio < 0}>
              {stats.permisosCambio > 0 ? '+' : ''}{stats.permisosCambio}% desde el mes pasado
            </StatChange>
          )}
        </StatCard>
      </StatisticsGrid>

      <ChartGrid>
        <Card>
          <Card.Header>
            <h3>Actividad Reciente</h3>
          </Card.Header>
          <Card.Body>
            <ActivityList>
              {activity.length > 0 ? (
                activity.map((item, index) => (
                  <ActivityItem key={index}>
                    <ActivityDate>{new Date(item.fecha).toLocaleDateString()}</ActivityDate>
                    <ActivityDescription>{item.descripcion}</ActivityDescription>
                  </ActivityItem>
                ))
              ) : (
                <p>No hay actividad reciente para mostrar.</p>
              )}
            </ActivityList>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3>Estadísticas de Uso</h3>
          </Card.Header>
          <Card.Body>
            <div>
              <p><strong>Tasa de completado de tareas:</strong> {stats.tasaCompletado || 0}%</p>
              <p><strong>Proyectos completados este mes:</strong> {stats.proyectosCompletadosMes || 0}</p>
              <p><strong>Usuarios activos este mes:</strong> {stats.usuariosActivosMes || 0}</p>
              <p><strong>Permisos aprobados este mes:</strong> {stats.permisosAprobadosMes || 0}</p>
            </div>
          </Card.Body>
        </Card>
      </ChartGrid>

      <ChartGrid>
        <Card>
          <Card.Header>
            <h3>Distribución de Usuarios por Rol</h3>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <h4>Administradores</h4>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stats.distribucionRoles?.admin || 0}</p>
              </div>
              <div>
                <h4>Gerentes</h4>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stats.distribucionRoles?.gerente || 0}</p>
              </div>
              <div>
                <h4>Usuarios</h4>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stats.distribucionRoles?.usuario || 0}</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3>Distribución de Tareas</h3>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Pendientes</span>
                  <span>{stats.distribucionTareas?.pendiente || 0}</span>
                </div>
                <div style={{ height: '0.5rem', width: '100%', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(stats.distribucionTareas?.pendiente / (stats.tareasTotales || 1)) * 100}%`, 
                    backgroundColor: '#F59E0B' 
                  }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>En Progreso</span>
                  <span>{stats.distribucionTareas?.en_progreso || 0}</span>
                </div>
                <div style={{ height: '0.5rem', width: '100%', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(stats.distribucionTareas?.en_progreso / (stats.tareasTotales || 1)) * 100}%`, 
                    backgroundColor: '#3B82F6' 
                  }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Completadas</span>
                  <span>{stats.distribucionTareas?.completado || 0}</span>
                </div>
                <div style={{ height: '0.5rem', width: '100%', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(stats.distribucionTareas?.completado / (stats.tareasTotales || 1)) * 100}%`, 
                    backgroundColor: '#10B981' 
                  }}></div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </ChartGrid>
    </div>
  );
};

export default AdminDashboardPage;
