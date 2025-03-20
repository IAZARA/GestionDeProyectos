import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUsers, updateUserStatus, updateUserRole, createUser } from '../../services/user.service';
import CreateUserModal from './components/CreateUserModal';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
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

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    isActive: '',
    role: '',
    search: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        });
        
        setUsers(response.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 1,
          offset: (pagination.page - 1) * pagination.limit
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios. Por favor, inténtelo de nuevo.');
        setLoading(false);
      }
    };

    fetchUsers();
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

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await updateUserRole(selectedUser._id, newRole);
      
      // Actualizar usuario en la lista local
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? { ...user, role: newRole } : user
      ));
      
      setIsRoleModalOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error al actualizar rol:', err);
      setError('No se pudo actualizar el rol del usuario. Por favor, inténtelo de nuevo.');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    
    try {
      const newStatus = !selectedUser.isActive;
      await updateUserStatus(selectedUser._id, newStatus);
      
      // Actualizar usuario en la lista local
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? { ...user, isActive: newStatus } : user
      ));
      
      setIsStatusModalOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('No se pudo actualizar el estado del usuario. Por favor, inténtelo de nuevo.');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'info';
      case 'manager':
        return 'warning';
      case 'user':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (isActive) => {
    return isActive ? 'success' : 'danger';
  };

  const getStatusLabel = (isActive) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const userColumns = [
    {
      header: 'Usuario',
      accessor: 'firstName',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Avatar 
            name={`${row.firstName} ${row.lastName}`} 
            src={row.profilePicture} 
          />
          <div>
            <div style={{ fontWeight: 500 }}>{`${row.firstName} ${row.lastName}`}</div>
            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Rol',
      accessor: 'role',
      cell: (row) => (
        <Badge variant={getRoleBadgeVariant(row.role)}>
          {getRoleLabel(row.role)}
        </Badge>
      )
    },
    {
      header: 'Estado',
      accessor: 'isActive',
      cell: (row) => (
        <Badge variant={getStatusBadgeVariant(row.isActive)}>
          {getStatusLabel(row.isActive)}
        </Badge>
      )
    },
    {
      header: 'Área',
      accessor: 'expertiseArea',
      cell: (row) => {
        const areas = {
          'administrative': 'Administrativa',
          'technical': 'Técnica',
          'legal': 'Legal'
        };
        return areas[row.expertiseArea] || 'No asignada';
      }
    },
    {
      header: 'Departamento',
      accessor: 'department',
      cell: (row) => row.department || 'No asignado'
    },
    {
      header: 'Fecha Registro',
      accessor: 'createdAt',
      cell: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => openRoleModal(row)}
          >
            Cambiar Rol
          </Button>
          <Button 
            size="sm" 
            variant={row.isActive ? 'danger' : 'success'}
            onClick={() => openStatusModal(row)}
          >
            {row.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Spinner fullPage />;
  }

  return (
    <div>
      <PageHeader>
        <PageTitle>Gestión de Usuarios</PageTitle>
        <Button
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 3C10.5523 3 11 3.44772 11 4V9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H11V16C11 16.5523 10.5523 17 10 17C9.44772 17 9 16.5523 9 16V11H4C3.44772 11 3 10.5523 3 10C3 9.44772 3.44772 9 4 9H9V4C9 3.44772 9.44772 3 10 3Z" fill="currentColor"/>
            </svg>
          }
          onClick={() => setIsCreateModalOpen(true)}
        >
          Nuevo Usuario
        </Button>
      </PageHeader>

      {error && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1rem', 
          backgroundColor: '#FEE2E2', 
          border: '1px solid #DC2626',
          borderRadius: '0.375rem',
          color: '#DC2626'
        }}>
          {error}
        </div>
      )}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel htmlFor="isActive">Estado:</FilterLabel>
          <FilterSelect 
            id="isActive" 
            name="isActive" 
            value={filters.isActive}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="role">Rol:</FilterLabel>
          <FilterSelect 
            id="role" 
            name="role" 
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="user">Usuario</option>
          </FilterSelect>
        </FilterGroup>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SearchInput 
            type="text" 
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Buscar por nombre o email..."
          />
          <Button type="submit" size="sm">Buscar</Button>
        </form>
      </FiltersContainer>

      <Card>
        <Table 
          columns={userColumns}
          data={users}
          emptyMessage="No hay usuarios que coincidan con los filtros"
          pagination={pagination}
          hoverableRows
        />
      </Card>

      {/* Modal para cambiar rol */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)}
        size="sm"
      >
        <Modal.Header onClose={() => setIsRoleModalOpen(false)}>
          Cambiar Rol de Usuario
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p>Usuario: <strong>{`${selectedUser.firstName} ${selectedUser.lastName}`}</strong></p>
              <p>Rol actual: <strong>{getRoleLabel(selectedUser.role)}</strong></p>
              
              <FormControl.Select
                id="newRole"
                label="Nuevo Rol"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">Usuario</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
              </FormControl.Select>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateRole}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para cambiar estado */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)}
        size="sm"
      >
        <Modal.Header onClose={() => setIsStatusModalOpen(false)}>
          Cambiar Estado de Usuario
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p>Usuario: <strong>{`${selectedUser.firstName} ${selectedUser.lastName}`}</strong></p>
              <p>Estado actual: <strong>{getStatusLabel(selectedUser.isActive)}</strong></p>
              <p>¿Está seguro que desea {selectedUser.isActive ? 'desactivar' : 'activar'} este usuario?</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateStatus}
            variant={selectedUser?.isActive ? 'danger' : 'success'}
          >
            {selectedUser?.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear usuario */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={async (userData) => {
          try {
            const response = await createUser(userData);
            
            if (response.success) {
              // Recargar la lista de usuarios para obtener los datos más recientes
              const updatedResponse = await getUsers({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
              });
              
              setUsers(updatedResponse.users || []);
              setPagination(prev => ({
                ...prev,
                total: updatedResponse.total || 0,
                totalPages: updatedResponse.totalPages || 1
              }));

              setError(null);
              return response.user;
            } else {
              throw new Error(response.message || 'Error al crear el usuario');
            }
          } catch (error) {
            console.error('Error al crear usuario:', error);
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'Error al crear el usuario. Por favor, inténtelo de nuevo.';
            setError(errorMessage);
            throw error;
          }
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
