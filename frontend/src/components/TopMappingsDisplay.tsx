// frontend/src/components/TopMappingsDisplay.tsx
import React from 'react';
import { TopMappingDetail, Mapping } from '../types';

interface Props {
    topMappings: TopMappingDetail[];
    totalDataCount: number;
}

const formatMapping = (mapping: Mapping): string => {
    return Object.entries(mapping)
        .sort(([, valA], [, valB]) => valA - valB)
        .map(([key, val]) => `${key.toUpperCase()}=${val}`)
        .join(', ');
};

const renderAnimalImage = (animal: string | undefined) => {
    if (!animal || animal === "Không có") return null;
    const imagePath = `/images/animals/${animal.toLowerCase()}.png`; 
    return <img src={imagePath} alt={animal} className="animal-icon-small" onError={(e) => (e.currentTarget.style.display = 'none')} />;
};


const TopMappingsDisplay: React.FC<Props> = ({ topMappings, totalDataCount }) => {
    if (!topMappings || topMappings.length === 0) {
        return null; // Không hiển thị gì nếu không có top mappings
    }

    return (
        <div className="top-mappings-display">
            <h4>Top Mappings Gần Đúng Nhất (Tối đa 9)</h4>
            <div className="mappings-grid">
                {topMappings.map((tm, index) => (
                    <div key={index} className="mapping-card">
                        <p><strong>Hạng {index + 1}</strong> ({tm.correct_count}/{totalDataCount} đúng)</p>
                        <p>Mapping: {formatMapping(tm.mapping)}</p>
                        <p>Lô: {tm.lo}</p>
                        {tm.prediction && (
                            <div className="prediction"> {/* Re-use prediction class for consistency if desired */}
                                <p>Nếu ván hiện tại là: <strong>{tm.prediction.van_sau.toUpperCase()}</strong></p>
                                <p>
                                    Dự đoán: <strong>{tm.prediction.predicted_animal.toUpperCase()} {renderAnimalImage(tm.prediction.predicted_animal)}</strong> (Giá trị: {tm.prediction.result_value})
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopMappingsDisplay;