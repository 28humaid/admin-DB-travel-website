import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';

const DataTable = ({ data, onDelete, onEdit }) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  // Get headers, excluding password and _id
  const headers = data[0] ? Object.keys(data[0]).filter(key => key !== 'password' && key !== '_id') : [];

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-blue-300">
            {headers.map((header) => (
              <th key={header} className="px-4 py-2 border-b text-left capitalize whitespace-nowrap">
                {header.replace(/([A-Z])/g, ' $1').trim()}
              </th>
            ))}
            <th className="px-4 py-2 border-b text-left whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-blue-300">
              {headers.map((header) => (
                <td key={header} className="px-4 py-2 border-b whitespace-nowrap text-[14px]">
                  {header === 'emails' ? (
                    <ul className="list-disc pl-5">
                      {Array.isArray(item.emails) ? item.emails.map((email, index) => (
                        <li key={index}>{email}</li>
                      )) : 'No emails'}
                    </ul>
                  ) : (
                    item[header] || 'N/A'
                  )}
                </td>
              ))}
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
                    onClick={() => onDelete(item.id)}
                    className="text-red-500 hover:text-red-700 flex items-center"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;