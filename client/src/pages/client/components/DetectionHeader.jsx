import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, RefreshCw } from 'lucide-react';

export default function DetectionHeader({
  timeRange,
  setTimeRange,
  isRefreshing,
  onRefresh,
  onExport
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 bg-white rounded-lg border border-[#E2E2E2] shadow-sm p-6">
      <div>
        <h2 className="text-3xl font-semibold text-[#1A1A1A] flex items-center gap-3">
          Detections
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-normal text-[#666666] px-3 py-1 bg-[#F5F5F5] rounded-full flex items-center gap-2">
                  <RefreshCw 
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''} cursor-pointer`}
                    onClick={onRefresh}
                  />
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
        <p className="text-[#666666] mt-2 text-[15px]">Monitor detected content across platforms</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Export Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={onExport}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export data as CSV</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-white rounded-md border border-[#E2E2E2] p-1">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm transform scale-[0.98]'
                  : 'text-[#666666] hover:bg-[#F5F5F5]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 