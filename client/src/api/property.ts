// import { api } from "./api";

export const propertyApi = {
  getProperties: async () => {
    try {
      const exampleProperties = [
        {
          id: 2525,
          name: "Oceanview Towers",
          address: "123 Beach Road, Miami, FL 33139",
          units: 48,
          tenantCount: 42,
          occupancyRate: 87.5,
          status: "active",
          imageUrl: "https://example.com/oceanview.jpg",
        },
        {
          id: 225,
          name: "Maple Gardens",
          address: "789 Maple Avenue, Seattle, WA 98101",
          units: 32,
          tenantCount: 31,
          occupancyRate: 96.9,
          status: "active",
        },
        {
          id: 339,
          name: "Sunset Villas",
          address: "456 Sunset Blvd, Los Angeles, CA 90028",
          units: 64,
          tenantCount: 58,
          occupancyRate: 90.6,
          status: "active",
        },
      ];
      return exampleProperties;
    } catch {
      return null;
    }
  },
};
