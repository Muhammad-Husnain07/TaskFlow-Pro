const Checkbox = ({ checked, onChange, label, className = '', disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ${
          checked 
            ? 'bg-primary-500 border-primary-500' 
            : 'border-gray-300 dark:border-gray-600'
        } peer-focus:ring-2 peer-focus:ring-primary-500/50`}>
          {checked && (
            <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;