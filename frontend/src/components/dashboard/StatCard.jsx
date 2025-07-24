const StatCard = ({
  title,
  value,
  change,
  changeType = "positive",
  icon: Icon,
  trend,
  subtitle,
}) => {
  const getChangeColor = () => {
    if (changeType === "positive") return "text-green-600";
    if (changeType === "negative") return "text-red-600";
    return "text-gray-600";
  };

  const getChangeIcon = () => {
    if (changeType === "positive") return "↗";
    if (changeType === "negative") return "↘";
    return "→";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {change && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()} {change}
              </span>
              {trend && (
                <span className="text-xs text-gray-500">vs last month</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-[#007991]/10 rounded-lg">
            <Icon className="h-6 w-6 text-[#007991]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
