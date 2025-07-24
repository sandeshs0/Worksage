import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import clientService from '../services/clientService';

function ProjectFilter({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use useCallback to prevent function recreation on each render
  const updateFilters = useCallback(() => {
    onFilterChange({
      searchTerm,
      status: statusFilter,
      clientId: clientFilter
    });
  }, [searchTerm, statusFilter, clientFilter, onFilterChange]);

  // Apply filters when any filter value changes
  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  useEffect(() => {
    // Fetch clients for the client filter dropdown
    async function fetchClients() {
      try {
        setIsLoading(true);
        const clientsList = await clientService.getAllClients();
        setClients(clientsList);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClients();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#007991] focus:border-[#007991]"
          />
        </div>

        {/* Status filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#007991] focus:border-[#007991] bg-white"
          >
            <option value="">All Statuses</option>
            <option value="in progress">In Progress</option>
            <option value="not started">Not Started</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Client filter */}
        <div className="w-full md:w-64">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#007991] focus:border-[#007991] bg-white"
            disabled={isLoading}
          >
            <option value="">All Clients</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default ProjectFilter;