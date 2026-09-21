import { useCallback, useEffect, useMemo, useState } from "react";

import type { CustomerLocation } from "../../../domain/models/location";
import type { ServiceCategoryId, Technician, TechnicianSearchCriteria } from "../../../domain/models/technician";
import { technicianRepository } from "../../../services/repositories";
import { getCustomerLocation, jerusalemDemoLocation } from "../../../services/location/locationService";


export interface CustomerMapFilters {
  availableOnly: boolean;
  categoryId?: ServiceCategoryId;
  maximumDistanceKm: number;
  minimumRating: number;
  query: string;
}

const initialFilters: CustomerMapFilters = {
  availableOnly: false,
  maximumDistanceKm: 10,
  minimumRating: 0,
  query: ""
};

export function useCustomerMap() {
  const [location, setLocation] = useState<CustomerLocation | undefined>(() => jerusalemDemoLocation);
  const [filters, setFilters] = useState<CustomerMapFilters>(initialFilters);
  const [allTechnicians, setAllTechnicians] = useState<readonly Technician[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    void getCustomerLocation().then((value) => { if (value) setLocation(value); });
  }, []);

  const criteria = useMemo<TechnicianSearchCriteria>(
    () => ({
      availableOnly: filters.availableOnly,
      categoryId: filters.categoryId,
      maximumDistanceKm: filters.maximumDistanceKm,
      minimumRating: filters.minimumRating,
      query: filters.query
    }),
    [filters]
  );

  const loadTechnicians = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await technicianRepository.findNearby(undefined, { categoryId: filters.categoryId });
      setAllTechnicians(result);
      setSelectedId((current) => result.some(({ id }) => id === current) ? current : undefined);
    } catch (caught) {
      setError(caught);
    } finally {
      setIsLoading(false);
    }
  }, [filters.categoryId]);

  useEffect(() => {
    void loadTechnicians();
  }, [loadTechnicians]);

  const technicians = useMemo(() => allTechnicians.filter((technician) =>
    (!criteria.query || `${technician.name} ${technician.specialty}`.toLowerCase().includes(criteria.query.toLowerCase())) &&
    (!criteria.minimumRating || technician.rating >= criteria.minimumRating) &&
    (!criteria.availableOnly || technician.isAvailable)
  ), [allTechnicians, criteria]);
  const selectedTechnician = technicians.find(({ id }) => id === selectedId);

  return {
    error,
    filters,
    isLoading,
    location,
    retry: loadTechnicians,
    selectedTechnician,
    selectTechnician: setSelectedId,
    setAvailableOnly: (availableOnly: boolean) => setFilters((current) => ({ ...current, availableOnly })),
    setCategoryId: (categoryId?: ServiceCategoryId) => setFilters((current) => ({ ...current, categoryId })),
    setMaximumDistanceKm: (maximumDistanceKm: number) => setFilters((current) => ({ ...current, maximumDistanceKm })),
    setMinimumRating: (minimumRating: number) => setFilters((current) => ({ ...current, minimumRating })),
    setQuery: (query: string) => setFilters((current) => ({ ...current, query })),
    technicians
  };
}
