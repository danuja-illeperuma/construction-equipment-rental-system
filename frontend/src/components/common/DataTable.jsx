import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  emptyTitle,
  onRowClick,
  className = '',
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-xs">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />;
  }

  return (
    <div className={`overflow-hidden bg-white rounded-xl border border-[#DFE8F0] shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#DFE8F0] text-left text-sm">
          <thead className="bg-[#F5F9FC] text-2xs font-heading font-bold uppercase tracking-wider text-[#263746] border-b border-[#DFE8F0]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 whitespace-nowrap ${col.className || ''} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE8F0]/60">
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-[#F5F9FC]' : 'hover:bg-[#F5F9FC]/60'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-5 py-3.5 whitespace-nowrap text-[#263746] ${col.className || ''} ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
