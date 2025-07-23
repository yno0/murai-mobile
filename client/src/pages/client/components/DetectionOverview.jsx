import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, BarChart3, PieChart, LineChart, Users } from 'lucide-react';

export default function DetectionOverview({ totalType, trends, timeRange }) {
  return (
    <div className="mt-0 space-y-6">
      {/* Basic KPIs for Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-[#E2E2E2] shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Detections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[#1A1A1A]">{totalType}</div>
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              trends.total.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trends.total.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {trends.total.value} from last {timeRange}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E2E2] shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Weekly Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">+60%</div>
            <div className="text-sm text-[#666666] mt-1">
              Compared to last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E2E2] shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Most Active Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[#1A1A1A]">Facebook</div>
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              trends.site.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trends.site.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {trends.site.value} activity
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E2E2] shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-[#666666] flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Top Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[#1A1A1A]">English</div>
            <div className={`text-sm mt-1 flex items-center gap-1 ${
              trends.language.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trends.language.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {trends.language.value} usage
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 