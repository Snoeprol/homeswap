'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, EuroIcon, MapPinIcon, HomeIcon } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

export interface Filters {
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  location: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const propertyTypes = [
  "House",
  "Apartment",
  "Condo",
  "Villa",
  "Cottage",
  "Townhouse",
];

export default function SearchFilters({ onFilter }: { onFilter: (filters: Filters) => void }) {
  const [filters, setFilters] = useState<Filters>({
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    location: '',
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handlePropertyTypeChange = (value: string) => {
    setFilters({ ...filters, propertyType: value });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters({
      ...filters,
      dateRange: {
        from: range?.from,
        to: range?.to
      }
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-auto flex-1">
            <div className="relative">
              <EuroIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleChange}
                className="pl-8 w-full"
              />
            </div>
          </div>
          <div className="w-full md:w-auto flex-1">
            <div className="relative">
              <EuroIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleChange}
                className="pl-8 w-full"
              />
            </div>
          </div>
          <div className="w-full md:w-auto flex-1">
            <Select onValueChange={handlePropertyTypeChange} value={filters.propertyType}>
              <SelectTrigger className="w-full">
                <HomeIcon className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto flex-1">
            <div className="relative">
              <MapPinIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                name="location"
                placeholder="Location"
                value={filters.location}
                onChange={handleChange}
                className="pl-8 w-full"
              />
            </div>
          </div>
          <div className="w-full md:w-auto flex-1">
          </div>
          <Button type="submit" className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600">
            Apply Filters
          </Button>
        </form>
      </div>
    </div>
  );
}