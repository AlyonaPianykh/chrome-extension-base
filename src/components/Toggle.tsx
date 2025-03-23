import React from 'react';

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
    return (
        <div className="toggle-container">
            <label className="toggle-label">
                <span>{label}</span>
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                </div>
            </label>
        </div>
    );
};

export default Toggle;