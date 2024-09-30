import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Listing {
  id: string;
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  rentPrice: number;
  city: string;
  country: string;
  images: string[];
  latitude: number | undefined;
  longitude: number | undefined;
}

interface SearchFiltersProps {
  listings: Listing[];
  onFilterChange: (filteredListings: Listing[]) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ listings, onFilterChange }) => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleFilter = () => {
    const filtered = listings.filter((listing) => {
      const matchLocation = location ? 
        listing.city.toLowerCase().includes(location.toLowerCase()) || 
        listing.country.toLowerCase().includes(location.toLowerCase()) : true;
      const matchPropertyType = propertyType !== 'all' ? listing.propertyType === propertyType : true;
      const matchMinPrice = minPrice ? listing.rentPrice >= parseInt(minPrice) : true;
      const matchMaxPrice = maxPrice ? listing.rentPrice <= parseInt(maxPrice) : true;

      return matchLocation && matchPropertyType && matchMinPrice && matchMaxPrice;
    });

    onFilterChange(filtered);
  };

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Property Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <Button onClick={handleFilter} className="mt-4 w-full">Apply Filters</Button>
    </div>
  );
};

export default SearchFilters;