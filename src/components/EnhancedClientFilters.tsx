
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Users, Calendar, AlertCircle, Building } from 'lucide-react';

interface FilterState {
  search: string;
  status: string;
  healthStatus: string;
  contractStatus: string;
  accountManager: string;
  industry: string;
  clientSize: string;
  lastContact: string;
}

interface EnhancedClientFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  quickFilters?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    filters: Partial<FilterState>;
  }>;
}

const EnhancedClientFilters = ({ 
  filters, 
  onFiltersChange, 
  resultCount,
  quickFilters = [
    { key: 'active', label: 'Active Clients', icon: <Building className="w-3 h-3" />, filters: { status: 'active' } },
    { key: 'needs_attention', label: 'Needs Attention', icon: <AlertCircle className="w-3 h-3" />, filters: { healthStatus: 'needs_attention' } },
    { key: 'expiring', label: 'Contracts Expiring', icon: <Calendar className="w-3 h-3" />, filters: { contractStatus: 'expiring' } },
    { key: 'no_contact', label: 'No Recent Contact', icon: <Users className="w-3 h-3" />, filters: { lastContact: 'over_30_days' } }
  ]
}: EnhancedClientFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const applyQuickFilter = (quickFilter: any) => {
    onFiltersChange({ ...filters, ...quickFilter.filters });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      healthStatus: '',
      contractStatus: '',
      accountManager: '',
      industry: '',
      clientSize: '',
      lastContact: ''
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  const isQuickFilterActive = (quickFilter: any) => {
    return Object.entries(quickFilter.filters).every(([key, value]) => 
      filters[key as keyof FilterState] === value
    );
  };

  const removeFilter = (key: keyof FilterState) => {
    updateFilter(key, '');
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search clients by name, company, email..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => updateFilter('search', suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-gray-500"
            >
              <X className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((quickFilter) => (
            <Button
              key={quickFilter.key}
              variant={isQuickFilterActive(quickFilter) ? "default" : "outline"}
              size="sm"
              onClick={() => applyQuickFilter(quickFilter)}
              className="flex items-center gap-1"
            >
              {quickFilter.icon}
              {quickFilter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Health Status</label>
              <Select value={filters.healthStatus} onValueChange={(value) => updateFilter('healthStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Health" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Health</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="needs_attention">Needs Attention</SelectItem>
                  <SelectItem value="issues">Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Contract Status</label>
              <Select value={filters.contractStatus} onValueChange={(value) => updateFilter('contractStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Contracts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Contracts</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Client Size</label>
              <Select value={filters.clientSize} onValueChange={(value) => updateFilter('clientSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sizes</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== '') {
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span className="capitalize">{key}: {value}</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeFilter(key as keyof FilterState)}
                  />
                </Badge>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {resultCount} {resultCount === 1 ? 'client' : 'clients'} found
      </div>
    </div>
  );
};

export default EnhancedClientFilters;
