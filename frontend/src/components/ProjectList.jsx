import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, User } from 'lucide-react';

function ProjectList({ projects, isLoading }) {
  const navigate = useNavigate();

  const handleProjectClick = (projectId) => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: '#18cb96' }}></div>
      </div>
    );
  }

  if (!projects || !projects.length) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No projects found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project._id}
          onClick={() => handleProjectClick(project._id)}
          className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-3/4">
              <h3 className="font-medium text-lg text-gray-900">{project.name}</h3>
              <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500">
                <span className="bg-gray-100 rounded px-2 py-1 mr-3 mb-2 flex items-center">
                  <Briefcase size={14} className="mr-1" /> {project.client?.name || "No Client"}
                </span>

                <span className="flex items-center mr-3 mb-2">
                  <User size={14} className="mr-1" /> {project.assignedTo || "Unassigned"}
                </span>

                <span className="flex items-center mb-2">
                  <Calendar size={14} className="mr-1" /> Due:{" "}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })
                    : "No deadline"}
                </span>
              </div>
              
              {project.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>

            <div className="w-full md:w-1/4 flex justify-end items-center mt-4 md:mt-0">
              <div className="flex flex-col items-end">
                <div className="relative h-16 w-16 mb-1">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e6e6e6" strokeWidth="2"></circle>
                    <circle
                      cx="18" cy="18" r="16"
                      fill="none"
                      stroke="#18cb96"
                      strokeWidth="2"
                      strokeDasharray={`${100 * (project.completionRate / 100) * 3.14 * 16 / 100} 100`}
                      strokeDashoffset="0"
                      transform="rotate(-90 18 18)"
                    ></circle>
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#18cb96">
                      {`${project.completionRate}%`}
                    </text>
                  </svg>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : project.status === 'in progress' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;