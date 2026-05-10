import { queryOptions, useQuery } from "@tanstack/react-query";
import { propertyApi } from "../../api/property.ts";

export const propertiesQueryOptions = queryOptions({
  queryKey: ["properties"],
  queryFn: propertyApi.getProperties,
});

export function useProperties() {
  return useQuery(propertiesQueryOptions);
}
