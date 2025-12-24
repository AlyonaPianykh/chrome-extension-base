import React from 'react';

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
    return (
        <div className="toggle-container">
            <label className="toggle-label" htmlFor="toggle-checkbox">
                <span className="label-text">{label}</span>
                <div className="toggle-switch">
                    <input
                        id="toggle-checkbox"
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