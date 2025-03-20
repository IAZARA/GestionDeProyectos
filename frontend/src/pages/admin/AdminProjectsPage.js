import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getProjectsReport } from '../../services/admin.service';
import { updateProject } from '../../services/project.service';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FormControl from '../../components/common/FormControl';
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

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1F2937;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1F2937;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
  margin-top: 0.25rem;
`;

const Progress = styled.div`
  height: 100%;
  background-color: #3B82F6;
  width: ${props => props.value || '0%'};
`;

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    estado: '',
    area: '',
    busqueda: ''
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    offset: 0,
    onNextPage: () => handlePageChange(pagination.page + 1),
    onPrevPage: () => handlePageChange(pagination.page - 1)
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getProjectsReport({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        });
        
        setProjects(response.projects || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
          offset: (pagination.page - 1) * pagination.limit
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
        setError('No se pudieron cargar los proyectos. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [filters, pagination.page, pagination.limit]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const openStatusModal = (project) => {
    setSelectedProject(project);
    setNewStatus(project.estado);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedProject || !newStatus) return;
    
    try {
      await updateProject(selectedProject._id, { estado: newStatus });
      
      // Actualizar proyecto en la lista local
      setProjects(prev => prev.map(project => 
        project._id === selectedProject._id ? { ...project, estado: newStatus } : project
      ));
      
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('No se pudo actualizar el estado del proyecto. Por favor, inténtelo de nuevo.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completado':
        return 'success';
      case 'en_progreso':
        return 'info';
      case 'en_pausa':
        return 'warning';
      case 'cancelado':
        return 'danger';
      case 'pendiente':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_progreso':
        return 'En Progreso';
      case 'en_pausa':
        return 'En Pausa';
      case 'cancelado':
        return 'Cancelado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const getAreaLabel = (area) => {
    switch (area) {
      case 'administrativa':
        return 'Administrativa';
      case 'tecnica':
        return 'Técnica';
      case 'legal':
        return 'Legal';
      case 'general':
        return 'General';
      default:
        return area;
    }
  };

  const projectColumns = [
    {
      header: 'Proyecto',
      accessor: 'nombre',
      cell: (row) => (
        <Link to={`/projects/${row._id}`} style={{ color: '#3B82F6', fontWeight: 500 }}>
          {row.nombre}
        </Link>
      )
    },
    {
      header: 'Estado',
      accessor: 'estado',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.estado)}>
          {getStatusLabel(row.estado)}
        </Badge>
      )
    },
    {
      header: 'Área',
      accessor: 'area',
      cell: (row) => getAreaLabel(row.area)
    },
    {
      header: 'Progreso',
      accessor: 'progreso',
      cell: (row) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem' }}>{row.progreso || 0}%</span>
          </div>
          <ProgressBar>
            <Progress value={`${row.progreso || 0}%`} />
          </ProgressBar>
        </div>
      )
    },
    {
      header: 'Miembros',
      accessor: 'miembros',
      cell: (row) => row.miembros?.length || 0
    },
    {
      header: 'Fecha Límite',
      accessor: 'fechaFin',
      cell: (row) => row.fechaFin ? new Date(row.fechaFin).toLocaleDateString() : 'Sin fecha'
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => openStatusModal(row)}
          >
            Cambiar Estado
          </Button>
          <Button 
            as={Link}
            to={`/projects/${row._id}`}
            size="sm" 
            variant="outline"
          >
            Ver
          </Button>
        </div>
      )
    }
  ];

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

  return (
    <div>
      <PageHeader>
        <PageTitle>Gestión de Proyectos</PageTitle>
      </PageHeader>

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel htmlFor="estado">Estado:</FilterLabel>
          <FilterSelect 
            id="estado" 
            name="estado" 
            value={filters.estado}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="en_pausa">En Pausa</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="area">Área:</FilterLabel>
          <FilterSelect 
            id="area" 
            name="area" 
            value={filters.area}
            onChange={handleFilterChange}
          >
            <option value="">Todas</option>
            <option value="general">General</option>
            <option value="administrativa">Administrativa</option>
            <option value="tecnica">Técnica</option>
            <option value="legal">Legal</option>
          </FilterSelect>
        </FilterGroup>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SearchInput 
            type="text" 
            name="busqueda"
            value={filters.busqueda}
            onChange={handleFilterChange}
            placeholder="Buscar proyecto..."
          />
          <Button type="submit" size="sm">Buscar</Button>
        </form>
      </FiltersContainer>

      <Card>
        <Table 
          columns={projectColumns}
          data={projects}
          emptyMessage="No hay proyectos que coincidan con los filtros"
          pagination={pagination}
          hoverableRows
        />
      </Card>

      {/* Modal para cambiar estado */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)}
        size="sm"
      >
        <Modal.Header onClose={() => setIsStatusModalOpen(false)}>
          Cambiar Estado de Proyecto
        </Modal.Header>
        <Modal.Body>
          {selectedProject && (
            <div>
              <p>Proyecto: <strong>{selectedProject.nombre}</strong></p>
              <p>Estado actual: <strong>{getStatusLabel(selectedProject.estado)}</strong></p>
              
              <FormControl.Select
                id="newStatus"
                label="Nuevo Estado"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="en_pausa">En Pausa</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </FormControl.Select>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateStatus}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminProjectsPage;
