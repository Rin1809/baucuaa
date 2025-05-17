// frontend/src/components/DataTable.tsx
import React from 'react';
import { VanEntry } from '../types';

interface Props {
    data: VanEntry[];
    isOpen: boolean;
    onToggle: () => void;
    latestVanSau: string | null;
}

const DataTable: React.FC<Props> = ({ data, isOpen, onToggle, latestVanSau }) => {


    const hasData = data.length > 0;

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <h4>Lịch Sử ({data.length} ván)</h4>
                {hasData && (
                    <button onClick={onToggle} className="toggle-button subtle">
                        {isOpen ? 'Ẩn Lịch Sử' : 'Hiện Lịch Sử'}
                    </button>
                )}
            </div>

            {hasData && (
                <div className={`history-table-animated-content ${isOpen ? 'is-open' : 'is-closed'}`}>
                    <div className="table-scroll-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ván Trước</th>
                                    <th>Ván Sau</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{entry[0].toUpperCase()}</td>
                                        <td>{entry[1].toUpperCase()}</td> 
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {hasData && latestVanSau && (
                 <div className={`latest-van-sau-preview ${!isOpen ? 'is-visible' : 'is-hidden'}`}>
                    <span>Ván sau của lượt đấu mới nhất: </span>
                    <strong>{latestVanSau.toUpperCase()}</strong>
                </div>
            )}
            
            {!hasData && (
                 <p className="info-message">Không có dữ liệu lịch sử để hiển thị.</p>
            )}
        </div>
    );
};
export default DataTable;