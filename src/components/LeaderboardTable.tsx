import React from 'react';

const LeaderboardTable = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, i) => (
              <th key={i} className="py-6 px-6 text-text/20 font-black uppercase tracking-[0.3em] text-[10px]">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-accent/5 transition-all group">
              {columns.map((col, j) => (
                <td key={j} className="py-6 px-6 transition-all">
                  {col.render ? col.render(row, i) : <span className="text-text/80 font-medium">{row[col.key]}</span>}
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
