import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  MapPin,
  Home,
  Users,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { propertiesQueryOptions } from "../../../features/property/useProperties.ts";

// ============================================================================
// Types
// ============================================================================

type Property = {
  id: number;
  name: string;
  address: string;
  units: number;
  tenantCount: number;
  occupancyRate: number;
  status: "active" | "inactive";
  imageUrl?: string;
};

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/_authenticated/property/")({
  beforeLoad: async ({ context }) => {
    const properties = await context.queryClient.ensureQueryData(
      propertiesQueryOptions,
    );
    return { properties };
  },
  component: PropertiesPage,
});

// ============================================================================
// Main Component
// ============================================================================

function PropertiesPage() {
  const { properties } = Route.useRouteContext();

  if (!properties || properties.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <PageHeader
        title="My Properties"
        subtitle="Manage and monitor all your properties from one place"
      />
      <StatsGrid properties={properties} />
      <PropertiesGrid properties={properties} />
    </div>
  );
}

// ============================================================================
// Composition Components
// ============================================================================

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
          No properties found
        </h2>
        <p className="text-gray-400 dark:text-gray-500">
          You don't have any properties assigned yet.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Components
// ============================================================================

function StatsGrid({ properties }: { properties: Property[] }) {
  const stats = calculateStats(properties);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard
        icon={<Building2 className="w-5 h-5 text-emerald-500" />}
        value={stats.totalProperties}
        label="Total Properties"
        color="emerald"
      />
      <StatCard
        icon={<Users className="w-5 h-5 text-blue-500" />}
        value={stats.totalTenants}
        label="Total Tenants"
        color="blue"
      />
      <StatCard
        icon={<Home className="w-5 h-5 text-purple-500" />}
        value={stats.averageOccupancy}
        label="Avg. Occupancy"
        suffix="%"
        color="purple"
      />
    </div>
  );
}

function calculateStats(properties: Property[]) {
  return {
    totalProperties: properties.length,
    totalTenants: properties.reduce((sum, p) => sum + (p.tenantCount || 0), 0),
    averageOccupancy: Math.round(
      properties.reduce((sum, p) => sum + (p.occupancyRate || 0), 0) /
        properties.length,
    ),
  };
}

type StatCardProps = {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  color: "emerald" | "blue" | "purple";
};

function StatCard({ icon, value, label, suffix = "", color }: StatCardProps) {
  const colorClasses = {
    emerald:
      "from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 border-emerald-100 dark:border-gray-700",
    blue: "from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700",
    purple:
      "from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 border-purple-100 dark:border-gray-700",
  };

  const iconBgClasses = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 ${iconBgClasses[color]} rounded-lg`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
            {suffix}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Properties Grid Components
// ============================================================================

function PropertiesGrid({ properties }: { properties: Property[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to="/property/$propertyId"
      params={{ propertyId: String(property.id) }}
      className="group block"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardHeader property={property} />
        <CardContent property={property} />
        <CardFooter property={property} />
      </div>
    </Link>
  );
}

function CardHeader({ property }: { property: Property }) {
  return (
    <div className="relative h-40 bg-gradient-to-br from-emerald-400 to-green-600">
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
      <div className="absolute top-3 right-3">
        <StatusBadge status={property.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Property["status"] }) {
  const isActive = status === "active";
  return (
    <span
      className={`px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold ${
        isActive ? "text-emerald-600" : "text-gray-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function CardContent({ property }: { property: Property }) {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
          {property.name}
        </h3>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </div>

      <div className="space-y-2">
        <InfoRow
          icon={<MapPin className="w-3.5 h-3.5" />}
          text={property.address}
        />
        <InfoRow
          icon={<Home className="w-3.5 h-3.5" />}
          text={`${property.units} total units`}
        />
      </div>

      <Divider />
      <OccupancyInfo
        tenantCount={property.tenantCount}
        occupancyRate={property.occupancyRate}
      />
    </div>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px bg-gray-100 dark:bg-gray-700" />;
}

function OccupancyInfo({
  tenantCount,
  occupancyRate,
}: {
  tenantCount: number;
  occupancyRate: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tenantCount} tenants
          </span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="text-xs text-emerald-500 font-medium">
          {occupancyRate}% occupied
        </span>
      </div>
    </div>
  );
}

function CardFooter() {
  return (
    <div className="px-5 pb-5">
      <span className="text-xs text-emerald-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
        Details <ArrowRight className="w-3 h-3" />
      </span>
    </div>
  );
}
