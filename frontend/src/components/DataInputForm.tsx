// frontend/src/components/DataInputForm.tsx
import React, { useState } from 'react';
import { ANIMALS } from '../types'; 

interface Props {
    onAddData: (van_truoc: string, van_sau: string) => Promise<void>;
    onCalculate: () => Promise<void>;
    onDeleteAll: () => Promise<void>;
    isProcessing: boolean; 
    hasData: boolean;      
}

const ANIMAL_ABBREVIATIONS: { [key: string]: string } = {
    tom: "T", // Thay đổi để rõ ràng hơn trên chip
    cua: "C",
    ca: "CA",
    ga: "G",
    bau: "B",
    nai: "N",
};

const DataInputForm: React.FC<Props> = ({ 
    onAddData, 
    onCalculate, 
    onDeleteAll, 
    isProcessing, 
    hasData 
}) => {
    const [vanTruoc, setVanTruoc] = useState<string[]>(['', '', '']);
    const [vanSau, setVanSau] = useState<string[]>(['', '', '']);

    const handleAnimalChipClick = (animal: string) => {
        const firstEmptyTruocIndex = vanTruoc.indexOf('');
        if (firstEmptyTruocIndex !== -1) {
            const newVanTruoc = [...vanTruoc];
            newVanTruoc[firstEmptyTruocIndex] = animal;
            setVanTruoc(newVanTruoc);
            return;
        }

        const firstEmptySauIndex = vanSau.indexOf('');
        if (firstEmptySauIndex !== -1) {
            const newVanSau = [...vanSau];
            newVanSau[firstEmptySauIndex] = animal;
            setVanSau(newVanSau);
        }
    };

    const handleSlotClick = (
        index: number,
        type: 'truoc' | 'sau'
    ) => {
        if (type === 'truoc') {
            const newVanTruoc = [...vanTruoc];
            newVanTruoc[index] = ''; 
            setVanTruoc(newVanTruoc);
        } else {
            const newVanSau = [...vanSau];
            newVanSau[index] = ''; 
            setVanSau(newVanSau);
        }
    };
    
    const resetFormInputs = () => {
        setVanTruoc(['', '', '']);
        setVanSau(['', '', '']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (vanTruoc.some(v => !v) || vanSau.some(v => !v)) {
            alert("Vui lòng chọn đủ 3 con vật cho mỗi ván.");
            return;
        }
        const vanTruocStr = vanTruoc.join(' ');
        const vanSauStr = vanSau.join(' ');
        await onAddData(vanTruocStr, vanSauStr);
        resetFormInputs();
    };

    const renderSlots = (values: string[], type: 'truoc' | 'sau') => (
        <div className="slots-container">
            {values.map((value, index) => (
                <div
                    key={`${type}-slot-${index}`}
                    className={`slot ${value ? 'filled' : ''}`}
                    onClick={() => handleSlotClick(index, type)}
                    title={value ? `Bấm để xóa ${ANIMAL_ABBREVIATIONS[value] || value.toUpperCase()}` : "Ô trống, bấm chip để chọn"}
                >
                    {value ? (ANIMAL_ABBREVIATIONS[value] || value.toUpperCase()) : ''}
                </div>
            ))}
        </div>
    );

    const allInputsFilled = !vanTruoc.some(v => !v) && !vanSau.some(v => !v);

    return (
        <form onSubmit={handleSubmit} className="data-input-form-chips">
            <h4>Thêm Dữ Liệu Lịch Sử</h4> {/* Tiêu đề rõ ràng hơn */}
            
            <div className="form-section">
                <label>Ván Trước (3 con xuất hiện):</label>
                {renderSlots(vanTruoc, 'truoc')}
            </div>

            <div className="form-section">
                <label>Ván Sau (3 con xuất hiện):</label>
                {renderSlots(vanSau, 'sau')}
            </div>

            <div className="animal-chips-container">
                {ANIMALS.map(animal => (
                    <button
                        type="button"
                        key={animal}
                        className="animal-chip"
                        onClick={() => handleAnimalChipClick(animal)}
                        title={`Chọn ${ANIMAL_ABBREVIATIONS[animal]}`}
                    >
                        {ANIMAL_ABBREVIATIONS[animal] || animal.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="unified-actions">
                <button 
                    type="submit" 
                    title={!allInputsFilled ? "Vui lòng điền đủ các ô" : "Thêm Ván Mới vào Lịch Sử"} 
                    aria-label="Thêm Ván Mới"
                    className="button-with-icon modern-action-button" // Primary button
                    disabled={isProcessing || !allInputsFilled}
                >
                    <span role="img" aria-hidden="true" className="button-icon">➕</span>
                    Thêm Ván
                </button>
                <button 
                    type="button" 
                    onClick={resetFormInputs} 
                    className="button-with-icon modern-action-button secondary"
                    title="Xóa Lựa Chọn Hiện Tại Trên Form"
                    aria-label="Xóa Lựa Chọn Hiện Tại"
                    disabled={isProcessing}
                >
                    <span role="img" aria-hidden="true" className="button-icon">🔄</span>
                    Xóa Chọn
                </button>
                <button 
                    type="button"
                    onClick={onCalculate} 
                    disabled={isProcessing || !hasData}
                    title={isProcessing ? "Đang xử lý..." : (!hasData ? "Chưa có dữ liệu để tính toán" : "Bắt đầu phân tích dữ liệu")}
                    aria-label={isProcessing ? "Đang xử lý" : "Bắt đầu tính toán"}
                    className="button-with-icon modern-action-button" // Primary button
                >
                    {isProcessing ? ( 
                        <>
                            <span className="button-spinner"></span>
                            Đang Xử Lý...
                        </>
                    ) : (
                        <>
                            <span role="img" aria-hidden="true" className="button-icon">⚙️</span>
                            Tính Toán
                        </>
                    )}
                </button>
                <button 
                    type="button"
                    onClick={onDeleteAll} 
                    disabled={isProcessing || !hasData} 
                    className="button-with-icon modern-action-button danger"
                    title={!hasData ? "Không có dữ liệu lịch sử để xóa" : "Xóa toàn bộ lịch sử"}
                    aria-label="Xóa toàn bộ lịch sử"
                >
                     <span role="img" aria-hidden="true" className="button-icon">🗑️</span>
                     Xóa Hết
                </button>
            </div>
        </form>
    );
};

export default DataInputForm;