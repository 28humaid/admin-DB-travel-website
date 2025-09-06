import React from 'react';
import { Trash2 } from 'lucide-react';

const DataTable = ({ data, onDelete }) => {
  // Get headers from the first data item (including emails)
  const headers = data[0] ? Object.keys(data[0]) : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-blue-400">
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
                      {item.emails.map((emailObj, index) => (
                        <li key={index}>{Object.values(emailObj)[0]}</li>
                      ))}
                    </ul>
                  ) : (
                    item[header]
                  )}
                </td>
              ))}
              <td className="px-4 py-2 border-b whitespace-nowrap">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:text-red-700 flex items-center"
                  title="Delete (Token)"
                >
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;