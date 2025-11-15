import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';

const DataTable = ({ data, onDelete, onEdit, hideActions = false }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  // Get headers, excluding password and _id
  const headers = data[0] ? Object.keys(data[0]).filter(key => key !== 'password' && key !== 'clientId' && key !== '__v' && key !== 'id') : [];

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[460px] max-w-[300px] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px]">
      <table className="min-w-full bg-white border border-gray-300 table-fixed">
        <thead className="sticky top-0 bg-blue-300">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-2 border-b text-left capitalize whitespace-nowrap text-[15px]">
                {header.replace(/([A-Z])/g, ' $1').trim()}
              </th>
            ))}
            {!hideActions && (
              <th className="px-4 py-2 border-b text-left whitespace-nowrap text-[15px]">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-blue-300">
              {headers.map((header) => (
                <td key={header} className="px-4 py-2 border-b whitespace-nowrap text-[13px]">
                  {header === 'emails' ? (
                    <ul className="list-disc pl-5">
                      {Array.isArray(item.emails) ? item.emails.map((email, emailIndex) => (
                        <li key={emailIndex}>{email}</li>
                      )) : 'No emails'}
                    </ul>
                  ) : (
                    item[header] || 'N/A'
                  )}
                </td>
              ))}
              {!hideActions && (
                <td className="px-4 py-2 border-b whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                      title="Edit"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => onDelete(item.clientId)}
                      className="text-red-500 hover:text-red-700 flex items-center"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;