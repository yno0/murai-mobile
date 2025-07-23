import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, Search } from 'lucide-react';

export default function DetectionFilters({
  search,
  setSearch,
  site,
  setSite,
  language,
  setLanguage,
  type,
  setType,
  onClearFilters,
  sites,
  languages,
  types
}) {
  return (
    <div className="bg-white rounded-lg border border-[#E2E2E2] shadow-sm p-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]" />
          <Input
            type="text"
            placeholder="Search word or URL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-[#E2E2E2] text-[#1A1A1A] placeholder:text-[#999999] h-10 rounded-md focus:ring-2 focus:ring-blue-500/20 pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {Object.values({ site, language, type }).some(v => v !== 'All') && (
          <Button
            variant="ghost"
            className="text-[#666666] hover:text-[#1A1A1A]"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {Object.entries({ Site: site, Language: language, Type: type })
        .filter(([, value]) => value !== 'All')
        .length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries({ Site: site, Language: language, Type: type })
            .filter(([, value]) => value !== 'All')
            .map(([key, value]) => (
              <div
                key={key}
                className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {key}: {value}
                <button
                  onClick={() => {
                    switch (key) {
                      case 'Site': setSite('All'); break;
                      case 'Language': setLanguage('All'); break;
                      case 'Type': setType('All'); break;
                    }
                  }}
                  className="hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
} 