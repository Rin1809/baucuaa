// frontend/src/components/ResultsDisplay.tsx
import React from 'react';
import { CalculationResult, DetailedResultItem, Mapping } from '../types';

interface Props {
    results: CalculationResult | null;
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
    return <img src={imagePath} alt={animal} className="animal-icon" onError={(e) => (e.currentTarget.style.display = 'none')} />;
};


const ResultsDisplay: React.FC<Props> = ({ results }) => {
    if (!results) return null;
    // Message từ backend (ví dụ: không có data để tính) đã được xử lý ở App.tsx
    // if (results.message && results.total_data_count === 0) return <p className="info-message">{results.message}</p>;
    if (results.total_data_count === 0 && !results.message) return null; // Không hiển thị gì nếu không có data và không có message


    return (
        <div className="results-display">
            <h3>Kết Quả Phân Tích</h3>
            <div className="summary">
                <p><strong>Kết quả tốt nhất:</strong> {results.perfect_match ? <span className="perfect-match">CHÍNH XÁC TUYỆT ĐỐI!</span> : `Đúng ${results.max_correct_count}/${results.total_data_count} ván`} </p>
                {results.best_lo !== null && Object.keys(results.best_mapping).length > 0 ? (
                    <>
                        <p><strong>Mapping tốt nhất:</strong> {formatMapping(results.best_mapping)}</p>
                        <p><strong>Lô/Số cộng thêm (tốt nhất):</strong> {results.best_lo}</p>
                    </>
                ) : (
                    <p>Không tìm thấy mapping phù hợp.</p>
                )}
                <p><strong>Tổng số phép thử:</strong> {results.total_combinations.toLocaleString()}</p>
                <p><strong>Thời gian tính toán:</strong> {results.elapsed_time.toFixed(3)} giây</p>
                {results.equal_mappings_count > 0 && (
                    <p><strong>Số mapping cùng tỷ lệ đúng cao nhất:</strong> {results.equal_mappings_count}</p>
                )}
            </div>

            {results.next_prediction && (
                <div className="prediction next-prediction">
                    <h4>Dự Đoán Ván Tiếp Theo (dựa trên mapping tốt nhất)</h4>
                    <p>Nếu ván hiện tại là: <strong>{results.next_prediction.van_sau.toUpperCase()}</strong></p>
                    <p>
                        Thì ván sau có thể là: 
                        <strong>{results.next_prediction.predicted_animal.toUpperCase()} {renderAnimalImage(results.next_prediction.predicted_animal)} (Giá trị: {results.next_prediction.result_value})</strong>
                    </p>
                    <details>
                        <summary>Chi tiết tính toán dự đoán</summary>
                        <p>Các giá trị mapping: {results.next_prediction.mapping_values.join(' + ')} = {results.next_prediction.total}</p>
                        <p>Tổng + Lô: {results.next_prediction.total} + {results.next_prediction.lo} = {results.next_prediction.total_plus_lo}</p>
                        <p>Kết quả (modulo 6): {results.next_prediction.total_plus_lo} % 6 = {results.next_prediction.result_value}</p>
                    </details>
                </div>
            )}
            
            {results.animal_counts && Object.values(results.animal_counts).some(count => count > 0) && (
                <div className="animal-stats">
                    <h4>Thống Kê Dự Đoán (từ các mapping cùng tỷ lệ đúng cao nhất):</h4>
                    <ul>
                    {Object.entries(results.animal_counts)
                        .filter(([, count]) => count > 0) // Chỉ hiển thị nếu count > 0
                        .sort(([, countA], [, countB]) => countB - countA) 
                        .map(([animal, count]) => (
                        <li key={animal}>
                            {animal.toUpperCase()} {renderAnimalImage(animal)}: {count} lần
                        </li>
                    ))}
                    </ul>
                </div>
            )}


            {results.detailed_results && results.detailed_results.length > 0 && (
                <div className="detailed-results-table"> {/* Added this wrapper */}
                    <h4>Chi Tiết Từng Ván (với mapping tốt nhất)</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Ván</th>
                                <th>Trước</th>
                                <th>Sau (Thực tế)</th>
                                <th>Tính Toán</th>
                                <th>Dự Đoán</th>
                                <th>KQ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.detailed_results.map((item: DetailedResultItem) => (
                                <tr key={item.van_so} className={item.is_correct ? 'correct' : 'incorrect'}>
                                    <td>{item.van_so}</td>
                                    <td>{item.van_truoc.toUpperCase()}</td>
                                    <td>{item.van_sau.toUpperCase()}</td>
                                    <td>
                                        ({item.mapping_values.join('+')})+{item.lo} = {item.total_plus_lo} % 6 = <strong>{item.result_value}</strong>
                                    </td>
                                    <td>{item.predicted_animal.toUpperCase()} {renderAnimalImage(item.predicted_animal)}</td>
                                    <td>{item.is_correct ? 'ĐÚNG' : 'SAI'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;