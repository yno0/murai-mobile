import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, BarChart3, PieChart, LineChart, Users } from 'lucide-react';

export default function DetectionDetailed({
  detectionTrends,
  detectionsByDay,
  detectionsBySite,
  detectionsByLanguage,
  detectionsByType,
  topWords,
  totalType
}) {
  return (
    <div className="mt-0 space-y-6">
      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#E2E2E2] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total Detections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[#1A1A1A]">{totalType}</div>
            <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              {detectionTrends.Growth} from last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E2E2] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Weekly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666666]">Last Week</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{detectionTrends['Last Week']}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666666]">This Week</span>
              <span className="text-sm font-medium text-[#1A1A1A]">{detectionTrends['This Week']}</span>
            </div>
            <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div 
                className="h-2 bg-blue-500 rounded-full transition-all relative"
                style={{ width: '60%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-blue-600/50"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E2E2] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Daily Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 mt-4">
              {Object.entries(detectionsByDay).map(([day, count]) => (
                <div key={day} className="flex flex-col items-center group">
                  <div className="relative">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {count} detections
                    </div>
                    <div 
                      className="w-6 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all"
                      style={{ height: `${count * 10}px` }}
                    />
                  </div>
                  <div className="text-xs text-[#666666] mt-2">{day}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Detailed Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Site */}
        <Card className="border-[#E2E2E2] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              By Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detectionsBySite.map(site => (
              <div key={site.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#1A1A1A] font-medium">{site.name}</div>
                  <div className="text-sm text-[#666666] font-medium">{site.count}</div>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${site.count * 20}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Language */}
        <Card className="border-[#E2E2E2] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <Users className="w-4 h-4" />
              By Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detectionsByLanguage.map(lang => (
              <div key={lang.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#1A1A1A] font-medium">{lang.name}</div>
                  <div className="text-sm text-[#666666] font-medium">{lang.count}</div>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${lang.count * 25}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <Card className="border-[#E2E2E2] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              By Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detectionsByType.map(type => (
              <div key={type.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#1A1A1A] font-medium">{type.name}</div>
                  <div className="text-sm text-[#666666] font-medium">{type.count}</div>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                    style={{ width: `${(type.count / totalType) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Words */}
        <Card className="border-[#E2E2E2] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Top Words
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topWords.map(item => (
              <div key={item.word} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#1A1A1A] font-medium">{item.word}</div>
                  <div className="text-sm text-[#666666] font-medium">{item.count}</div>
                </div>
                <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                    style={{ width: `${(item.count / topWords[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 