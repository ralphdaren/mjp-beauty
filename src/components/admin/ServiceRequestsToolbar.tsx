import SearchFilterBar from './SearchFilterBar'
import StatusTabs from './StatusTabs'
import type { RequestStatus, ServiceRequestsController } from './serviceRequests'

export default function ServiceRequestsToolbar({ controller }: { controller: ServiceRequestsController }) {
  const c = controller

  return (
    <>
      <div className="px-6 pt-5 max-w-5xl mx-auto">
        <SearchFilterBar
          search={c.search}
          onSearchChange={c.setSearch}
          dateFrom={c.dateFrom}
          dateTo={c.dateTo}
          onDateFromChange={c.setDateFrom}
          onDateToChange={c.setDateTo}
          selects={[
            {
              label: 'Service',
              allLabel: 'All services',
              value: c.serviceFilter,
              options: c.serviceOptions,
              onChange: c.setServiceFilter,
            },
            {
              label: 'Option',
              allLabel: 'All options',
              value: c.optionFilter,
              options: c.optionOptions,
              onChange: c.setOptionFilter,
            },
          ]}
          hasActiveFilters={c.hasActiveFilters}
          onClear={c.clearFilters}
        />
      </div>

      <div className="px-6 pt-5 pb-3 max-w-5xl mx-auto">
        <StatusTabs<RequestStatus>
          value={c.tab}
          onChange={c.setTab}
          tabs={[
            { id: 'pending', label: 'Pending', count: c.tabCount('pending') },
            { id: 'accepted', label: 'Accepted', count: c.tabCount('accepted') },
          ]}
          more={[
            { id: 'declined', label: 'Declined', count: c.tabCount('declined') },
            { id: 'cancelled', label: 'Cancelled', count: c.tabCount('cancelled') },
          ]}
        />
      </div>
    </>
  )
}
