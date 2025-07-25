import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import clientService from '../services/clientService';

function ProjectForm({ project, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not started',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    client: '',
    completionRate: 0,
    expectedRevenue: 0,
    remarks: ''
  });
  
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [errors, setErrors] = useState({});

  // Load clients for dropdown
  useEffect(() => {
    async function fetchClients() {
      setIsLoadingClients(true);
      try {
        const data = await clientService.getAllClients();
        setClients(data);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoadingClients(false);
      }
    }
    
    fetchClients();
    
    // If editing an existing project, populate the form
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'not started',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        client: project.client?._id || '',
        completionRate: project.completionRate || 0,
        expectedRevenue: project.expectedRevenue || 0,
        remarks: project.remarks || ''
      });
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    if (!formData.client) {
      newErrors.client = 'Client selection is required';
    }
    
    if (formData.completionRate < 0 || formData.completionRate > 100) {
      newErrors.completionRate = 'Completion rate must be between 0 and 100';
    }
    
    if (formData.expectedRevenue < 0) {
      newErrors.expectedRevenue = 'Expected revenue cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Convert values to appropriate types
      const submitData = {
        ...formData,
        completionRate: Number(formData.completionRate),
        expectedRevenue: Number(formData.expectedRevenue)
      };
      
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Project Name*
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="Enter Project Name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border ${
            errors.name ? 'border-red-500' : 'border-gray-400'
          } bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          placeholder="Project description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Client*
          </label>
          <select
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border ${
              errors.client ? 'border-red-500' : 'border-gray-400'
            } bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800`}
            disabled={isLoadingClients}
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.client && <p className="text-red-500 text-sm mt-1">{errors.client}</p>}
        </div>
        
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
          >
            <option value="not started">Not Started</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Start Date*
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border ${
              errors.startDate ? 'border-red-500' : 'border-gray-400'
            } bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800`}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>
        
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${
              errors.endDate ? 'border-red-500' : 'border-gray-400'
            } bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800`}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Completion Rate (%)
          </label>
          <input
            type="number"
            name="completionRate"
            min="0"
            max="100"
            value={formData.completionRate}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${
              errors.completionRate ? 'border-red-500' : 'border-gray-400'
            } bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800`}
          />
          {errors.completionRate && <p className="text-red-500 text-sm mt-1">{errors.completionRate}</p>}
        </div>
        
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Expected Revenue (Rs.)
          </label>
          <input
            type="number"
            name="expectedRevenue"
            min="0"
            value={formData.expectedRevenue}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border ${
              errors.expectedRevenue ? 'border-red-500' : 'border-gray-400'
            } bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800`}
          />
          {errors.expectedRevenue && <p className="text-red-500 text-sm mt-1">{errors.expectedRevenue}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          name="remarks"
          placeholder="Additional notes about the project"
          value={formData.remarks}
          onChange={handleInputChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-1 focus:border-[#18cb96] text-gray-800"
        ></textarea>
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-md text-white flex items-center justify-center focus:outline-none"
          style={{ backgroundColor: '#18cb96' }}
        >
          {isSubmitting ? (
            <>
              <Loader size={18} className="animate-spin mr-2" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{project ? 'Update Project' : 'Create Project'}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;