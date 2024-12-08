'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { columns } from '../employee-tables/columns';
import { useEmployeeTableFilters } from '../employee-tables/use-employee-table-filters';

interface OrderDetails {
  order_id: string;
  created_at: string;
  status: string;
  total_price: number;
  payment_status: string;
  user_id: string;
  user_name: string;
  email: string;
}

interface OrderItems {
  id: number;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  order_id: string;
}

interface CombinedOrderDetails extends OrderDetails {
  items: OrderItems[];
}

export default function OrderDetailsPage({
  data,
  totalData,
  orderItems
}: {
  data: OrderDetails[];
  totalData: number;
  orderItems: OrderItems[];
}) {
  const {
    genderFilter,
    setGenderFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useEmployeeTableFilters();

  const combinedData: CombinedOrderDetails[] = data.map((order) => {
    return { ...order, items: orderItems }; // Combine the order and orderItems
  });

  return (
    <div className="space-y-4 ">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        {/* <DataTableFilterBox
          filterKey="gender"
          title="Gender"
          options={GENDER_OPTIONS}
          setFilterValue={setGenderFilter}
          filterValue={genderFilter}
        /> */}
        <DataTableResetFilter
          isFilterActive={isAnyFilterActive}
          onReset={resetFilters}
        />
      </div>
      <DataTable columns={columns} data={combinedData} totalItems={totalData} />
    </div>
  );
}
