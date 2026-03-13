import React from 'react';

const LeaderboardTable = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800">
            {columns.map((col, i) => (
              <th key={i} className="py-4 px-4 text-gray-400 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-800/50 hover:bg-white/5 transition">
              {columns.map((col, j) => (
                <td key={j} className="py-4 px-4">
                  {col.render ? col.render(row, i) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
