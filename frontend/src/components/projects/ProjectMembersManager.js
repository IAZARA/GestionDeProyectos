import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUsers } from '../../services/user.service';
import { getProjectMembers, addProjectMember, removeProjectMember, updateMemberRole } from '../../services/project.service';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import FormControl from '../common/FormControl';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: ${props => props.isHighlighted ? '#f0f9ff' : 'white'};
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MemberDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const MemberRole = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const MemberActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AddMemberForm = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  border: 1px dashed #d1d5db;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const NonMembersList = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
`;

const NonMemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  &:last-child {
    border-bottom: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ProjectMembersManager = ({ projectId, onMemberUpdate }) => {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [owner, setOwner] = useState(null);
  const { currentUser } = useAuth();

  // Verificar si el usuario actual es administrador o gestor del proyecto
  const canManageMembers = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        setLoading(true);
        const { members, owner } = await getProjectMembers(projectId);
        setMembers(members || []);
        setOwner(owner);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar miembros del proyecto:', error);
        setError('Error al cargar miembros del proyecto');
        setLoading(false);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users || []);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };

    fetchProjectMembers();
    fetchAllUsers();
  }, [projectId]);

  // Actualizar usuarios disponibles cuando cambian los miembros o todos los usuarios
  useEffect(() => {
    const memberIds = new Set(members.map(m => m.user._id));
    const filtered = allUsers.filter(user => !memberIds.has(user._id));
    setAvailableUsers(filtered);
  }, [members, allUsers]);

  const handleAddMember = async () => {
    if (!selectedUser) {
      setError('Por favor, selecciona un usuario');
      return;
    }

    try {
      setAdding(true);
      setError('');
      
      await addProjectMember(projectId, selectedUser);
      
      // Recargar miembros para actualizar la lista
      const { members } = await getProjectMembers(projectId);
      setMembers(members || []);
      
      // Notificar al componente padre sobre la actualización
      if (onMemberUpdate) {
        onMemberUpdate(members);
      }
      
      setSelectedUser('');
      setSuccess('Miembro añadido correctamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
      setAdding(false);
    } catch (error) {
      console.error('Error al añadir miembro:', error);
      setError('Error al añadir miembro al proyecto');
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setLoading(true);
      setError('');
      
      await removeProjectMember(projectId, userId);
      
      // Actualizar la lista de miembros localmente
      const updatedMembers = members.filter(m => m.user._id !== userId);
      setMembers(updatedMembers);
      
      // Notificar al componente padre sobre la actualización
      if (onMemberUpdate) {
        onMemberUpdate(updatedMembers);
      }
      
      setSuccess('Miembro eliminado correctamente');
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      setError('Error al eliminar miembro del proyecto');
      setLoading(false);
    }
  };

  if (loading && members.length === 0) {
    return <Spinner />;
  }

  return (
    <Container>
      <h3>Miembros del Proyecto</h3>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <div style={{ color: '#10b981', marginBottom: '1rem' }}>{success}</div>}
      
      <MembersList>
        {members.length > 0 ? (
          members.map((member) => (
            <MemberItem 
              key={member.user._id} 
              isHighlighted={owner && member.user._id === owner}
            >
              <MemberInfo>
                <Avatar 
                  name={`${member.user.firstName} ${member.user.lastName}`}
                  src={member.user.profilePicture} 
                  size="sm"
                />
                <MemberDetails>
                  <MemberName>{member.user.firstName} {member.user.lastName}</MemberName>
                  <MemberRole>
                    {member.user.role === 'admin' ? 'Administrador' : 
                     member.user.role === 'manager' ? 'Gestor' : 'Usuario'} 
                    {owner && member.user._id === owner ? ' (Propietario)' : ''}
                  </MemberRole>
                </MemberDetails>
              </MemberInfo>
              
              {canManageMembers && member.user._id !== currentUser?._id && 
               !(owner && member.user._id === owner) && (
                <MemberActions>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleRemoveMember(member.user._id)}
                  >
                    Eliminar
                  </Button>
                </MemberActions>
              )}
            </MemberItem>
          ))
        ) : (
          <p>No hay miembros asignados a este proyecto.</p>
        )}
      </MembersList>
      
      {canManageMembers && (
        <>
          <h4 style={{ marginTop: '1.5rem' }}>Añadir Miembros</h4>
          <AddMemberForm>
            <FormControl.Select
              label="Usuario"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{ flexGrow: 1 }}
            >
              <option value="">Seleccionar usuario</option>
              {availableUsers.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gestor' : 'Usuario'})
                </option>
              ))}
            </FormControl.Select>
            
            <Button 
              onClick={handleAddMember} 
              disabled={adding}
              variant="primary"
            >
              {adding ? <Spinner size="sm" /> : 'Añadir'}
            </Button>
          </AddMemberForm>
        </>
      )}
    </Container>
  );
};

export default ProjectMembersManager; 