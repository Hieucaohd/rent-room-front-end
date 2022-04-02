import React from 'react';

export const LoadingSpinner = ({ color, zoom }: any) => {
    return (
        <>
            <div className="threedot" style={{ zoom: zoom }}>
                <span style={color && { backgroundColor: color }}></span>
                <span style={color && { backgroundColor: color }}></span>
                <span style={color && { backgroundColor: color }}></span>
            </div>
        </>
    );
};

export default LoadingSpinner;
