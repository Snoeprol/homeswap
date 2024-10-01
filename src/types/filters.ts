export interface Filters {
  // ... all filter properties ...
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  // ... other filter properties ...
}