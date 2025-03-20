import React from 'react';
import styled, { css } from 'styled-components';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
`;

const TableHead = styled.thead`
  background-color: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
`;

const TableBody = styled.tbody`
  background-color: white;
  
  tr:not(:last-child) {
    border-bottom: 1px solid #E5E7EB;
  }
  
  ${props => props.stripedRows && css`
    tr:nth-child(even) {
      background-color: #F9FAFB;
    }
  `}
  
  ${props => props.hoverableRows && css`
    tr:hover {
      background-color: #F3F4F6;
    }
  `}
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #4B5563;
  white-space: nowrap;
  
  ${props => props.width && css`
    width: ${props.width};
  `}
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  color: #1F2937;
  
  ${props => props.align === 'right' && css`
    text-align: right;
  `}
  
  ${props => props.align === 'center' && css`
    text-align: center;
  `}
`;

const EmptyTableMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6B7280;
  width: 100%;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #F9FAFB;
  border-top: 1px solid #E5E7EB;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #4B5563;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.25rem 0.5rem;
  border: 1px solid #D1D5DB;
  background-color: white;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #F3F4F6;
  }
`;

const Table = ({
  columns,
  data,
  stripedRows = false,
  hoverableRows = true,
  emptyMessage = "No hay datos disponibles",
  pagination,
  ...props
}) => {
  return (
    <TableContainer {...props}>
      <StyledTable>
        <TableHead>
          <tr>
            {columns.map((column, index) => (
              <TableHeaderCell 
                key={index}
                width={column.width}
                align={column.align}
              >
                {column.header}
              </TableHeaderCell>
            ))}
          </tr>
        </TableHead>
        <TableBody stripedRows={stripedRows} hoverableRows={hoverableRows}>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <TableCell 
                    key={columnIndex}
                    align={column.align}
                  >
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </TableCell>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyTableMessage>{emptyMessage}</EmptyTableMessage>
              </td>
            </tr>
          )}
        </TableBody>
      </StyledTable>
      
      {pagination && (
        <Pagination>
          <PaginationInfo>
            Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} registros
          </PaginationInfo>
          <PaginationControls>
            <PaginationButton 
              onClick={pagination.onPrevPage} 
              disabled={pagination.page === 1}
            >
              Anterior
            </PaginationButton>
            <span>{pagination.page} de {pagination.totalPages}</span>
            <PaginationButton 
              onClick={pagination.onNextPage} 
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </PaginationButton>
          </PaginationControls>
        </Pagination>
      )}
    </TableContainer>
  );
};

export default Table;
