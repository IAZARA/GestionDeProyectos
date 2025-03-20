import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../../services/leave.service';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FormControl from '../../components/common/FormControl';
import Spinner from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';

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

const AdminLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    estado: '',
    tipo: '',
    busqueda: ''
  });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
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
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const response = await getLeaveRequests({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        });
        
        setLeaves(response.leaves || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
          offset: (pagination.page - 1) * pagination.limit
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar solicitudes de ausencia:', err);
        setError('No se pudieron cargar las solicitudes de ausencia. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    };

    fetchLeaves();
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

  const handleApprove = async (leaveId) => {
    try {
      await approveLeaveRequest(leaveId);
      
      // Actualizar solicitud en la lista local
      setLeaves(prev => prev.map(leave => 
        leave._id === leaveId ? { ...leave, estado: 'aprobado' } : leave
      ));
    } catch (err) {
      console.error('Error al aprobar solicitud:', err);
      setError('No se pudo aprobar la solicitud. Por favor, inténtelo de nuevo.');
    }
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedLeave || !rejectReason.trim()) return;
    
    try {
      await rejectLeaveRequest(selectedLeave._id, rejectReason);
      
      // Actualizar solicitud en la lista local
      setLeaves(prev => prev.map(leave => 
        leave._id === selectedLeave._id ? { 
          ...leave, 
          estado: 'rechazado',
          motivoRechazo: rejectReason 
        } : leave
      ));
      
      setIsRejectModalOpen(false);
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      setError('No se pudo rechazar la solicitud. Por favor, inténtelo de nuevo.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'aprobado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'rechazado':
        return 'danger';
      case 'cancelado':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aprobado':
        return 'Aprobado';
      case 'pendiente':
        return 'Pendiente';
      case 'rechazado':
        return 'Rechazado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'vacaciones':
        return 'Vacaciones';
      case 'enfermedad':
        return 'Enfermedad';
      case 'personal':
        return 'Personal';
      case 'otros':
        return 'Otros';
      default:
        return type;
    }
  };

  const leaveColumns = [
    {
      header: 'Solicitante',
      accessor: 'usuario',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Avatar 
            name={row.usuario?.nombre} 
            src={row.usuario?.avatar} 
          />
          <div style={{ fontWeight: 500 }}>{row.usuario?.nombre}</div>
        </div>
      )
    },
    {
      header: 'Tipo',
      accessor: 'tipo',
      cell: (row) => getTypeLabel(row.tipo)
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
      header: 'Fecha Inicio',
      accessor: 'fechaInicio',
      cell: (row) => new Date(row.fechaInicio).toLocaleDateString()
    },
    {
      header: 'Fecha Fin',
      accessor: 'fechaFin',
      cell: (row) => new Date(row.fechaFin).toLocaleDateString()
    },
    {
      header: 'Motivo',
      accessor: 'motivo',
      cell: (row) => row.motivo
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: (row) => {
        if (row.estado === 'pendiente') {
          return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button 
                size="sm" 
                variant="success"
                onClick={() => handleApprove(row._id)}
              >
                Aprobar
              </Button>
              <Button 
                size="sm" 
                variant="danger"
                onClick={() => openRejectModal(row)}
              >
                Rechazar
              </Button>
            </div>
          );
        }
        
        // Si ya no está pendiente, mostrar el motivo de rechazo o fecha de aprobación
        if (row.estado === 'rechazado' && row.motivoRechazo) {
          return (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Motivo: {row.motivoRechazo}</span>
            </div>
          );
        }
        
        if (row.estado === 'aprobado' && row.fechaAprobacion) {
          return (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                Aprobado: {new Date(row.fechaAprobacion).toLocaleDateString()}
              </span>
            </div>
          );
        }
        
        return null;
      }
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
        <PageTitle>Gestión de Permisos de Ausencia</PageTitle>
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
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="cancelado">Cancelado</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="tipo">Tipo:</FilterLabel>
          <FilterSelect 
            id="tipo" 
            name="tipo" 
            value={filters.tipo}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="vacaciones">Vacaciones</option>
            <option value="enfermedad">Enfermedad</option>
            <option value="personal">Personal</option>
            <option value="otros">Otros</option>
          </FilterSelect>
        </FilterGroup>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SearchInput 
            type="text" 
            name="busqueda"
            value={filters.busqueda}
            onChange={handleFilterChange}
            placeholder="Buscar solicitante..."
          />
          <Button type="submit" size="sm">Buscar</Button>
        </form>
      </FiltersContainer>

      <Card>
        <Table 
          columns={leaveColumns}
          data={leaves}
          emptyMessage="No hay solicitudes de ausencia que coincidan con los filtros"
          pagination={pagination}
          hoverableRows
        />
      </Card>

      {/* Modal para rechazar solicitud */}
      <Modal 
        isOpen={isRejectModalOpen} 
        onClose={() => setIsRejectModalOpen(false)}
        size="sm"
      >
        <Modal.Header onClose={() => setIsRejectModalOpen(false)}>
          Rechazar Solicitud de Ausencia
        </Modal.Header>
        <Modal.Body>
          {selectedLeave && (
            <div>
              <p>Solicitante: <strong>{selectedLeave.usuario?.nombre}</strong></p>
              <p>Tipo: <strong>{getTypeLabel(selectedLeave.tipo)}</strong></p>
              <p>Periodo: <strong>{new Date(selectedLeave.fechaInicio).toLocaleDateString()} - {new Date(selectedLeave.fechaFin).toLocaleDateString()}</strong></p>
              
              <FormControl.Textarea
                id="rejectReason"
                label="Motivo del Rechazo"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique el motivo del rechazo de la solicitud..."
                error={rejectReason.trim() === '' ? 'El motivo del rechazo es obligatorio' : ''}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReject}
            disabled={!rejectReason.trim()}
          >
            Rechazar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminLeavesPage;
