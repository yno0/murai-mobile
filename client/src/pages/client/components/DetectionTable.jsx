import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpRight, Calendar } from 'lucide-react';

export default function DetectionTable({
  filtered,
  selectedRows,
  sortConfig,
  onSort,
  onRowSelect,
  onSelectAll,
  onExport,
  onClearSelection
}) {
  return (
    <div className="bg-white rounded-lg border border-[#E2E2E2] shadow-sm">
      <div className="p-6 border-b border-[#E2E2E2] flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-[#1A1A1A]">Detection Log</h3>
          <p className="text-sm text-[#666666] mt-1">
            {selectedRows.length > 0 
              ? `${selectedRows.length} items selected`
              : 'Detailed list of all detected content'}
          </p>
        </div>
        
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-sm"
              onClick={onClearSelection}
            >
              Clear selection
            </Button>
            <Button
              variant="default"
              className="text-sm"
              onClick={onExport}
            >
              Export selected
            </Button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E2E2] bg-[#F9F9F9]">
              <th className="py-4 px-6 font-medium text-[#666666]">
                <input
                  type="checkbox"
                  checked={selectedRows.length === filtered.length}
                  onChange={onSelectAll}
                  className="rounded border-[#E2E2E2]"
                />
              </th>
              {['Word/Phrase', 'Date & Time', 'Site', 'URL', 'Language', 'Type'].map(header => (
                <th 
                  key={header}
                  className="text-left py-4 px-6 font-medium text-[#666666] cursor-pointer hover:text-[#1A1A1A]"
                  onClick={() => onSort(header.toLowerCase())}
                >
                  <div className="flex items-center gap-2">
                    {header}
                    {sortConfig.key === header.toLowerCase() && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E2E2]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[#666666]">
                  No detections found
                </td>
              </tr>
            ) : (
              filtered.map((d, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-[#F9F9F9] transition-colors ${
                    selectedRows.includes(idx) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(idx)}
                      onChange={() => onRowSelect(idx)}
                      className="rounded border-[#E2E2E2]"
                    />
                  </td>
                  <td className="py-4 px-6 text-[#1A1A1A] font-medium">{d.word}</td>
                  <td className="py-4 px-6 text-[#666666]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(d.datetime).toLocaleDateString()}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{new Date(d.datetime).toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="py-4 px-6 text-[#666666]">{d.site}</td>
                  <td className="py-4 px-6">
                    <a 
                      href={`https://${d.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {d.url}
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </td>
                  <td className="py-4 px-6 text-[#666666]">{d.language}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      d.type === 'profanity' ? 'bg-red-50 text-red-700' :
                      d.type === 'slur' ? 'bg-orange-50 text-orange-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {d.type}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 