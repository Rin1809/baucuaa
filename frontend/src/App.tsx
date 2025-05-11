// frontend/src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import DataInputForm from './components/DataInputForm';
import DataTable from './components/DataTable';
import ResultsDisplay from './components/ResultsDisplay';
import TopMappingsDisplay from './components/TopMappingsDisplay';
import { fetchData, addDataEntry, deleteAllData, calculateResults } from './services/apiService';
import { VanEntry, CalculationResult } from './types';
import './styles/App.css'; // Đảm bảo file CSS được import

type Theme = 'light' | 'dark';

function App() {
    const [inputData, setInputData] = useState<VanEntry[]>([]);
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Loading cho các action (add, delete, calculate)
    const [isLoadingData, setIsLoadingData] = useState(true); // Loading riêng cho việc tải dữ liệu ban đầu
    const [error, setError] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true); 

    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        return savedTheme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-mode' : '';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const toggleHistoryTable = () => {
        setIsHistoryOpen(prev => !prev);
    };

    const loadInitialData = useCallback(async () => {
        setIsLoadingData(true);
        setError(null);
        try {
            const data = await fetchData();
            setInputData(data);
        } catch (err: any) {
            setError(`Không thể tải dữ liệu lịch sử: ${err.message || 'Lỗi không xác định'}`);
            console.error("Load initial data error:", err);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleAddData = async (van_truoc: string, van_sau: string) => {
        setIsLoading(true); 
        setError(null);
        try {
            await addDataEntry(van_truoc, van_sau);
            await loadInitialData(); 
            // Optional: Tự động tính toán lại sau khi thêm dữ liệu mới nếu có dữ liệu
            // if (inputData.length + 1 > 0) { // Kiểm tra độ dài mới (sau khi loadInitialData)
            //    const results = await calculateResults();
            //    setCalculationResult(results);
            // }
        } catch (err: any) {
            setError(`Lỗi khi thêm dữ liệu: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`);
            console.error("Add data error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu lịch sử không? Thao tác này không thể hoàn tác.")) {
            setIsLoading(true); 
            setError(null);
            try {
                await deleteAllData();
                setInputData([]);
                setCalculationResult(null); // Xóa kết quả tính toán cũ
            } catch (err: any) {
                setError(`Lỗi khi xóa dữ liệu: ${err.message || 'Lỗi không xác định'}`);
                console.error("Delete all data error:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCalculate = async () => {
        if (inputData.length === 0 && !isLoadingData) { // Đảm bảo không phải đang load data ban đầu
            alert("Không có dữ liệu để tính toán. Vui lòng thêm dữ liệu trước.");
            return;
        }
        setIsLoading(true); 
        setError(null);
        try {
            const results = await calculateResults();
            setCalculationResult(results);
            if (results.message && results.total_data_count === 0) {
                // Xử lý thông báo từ backend nếu không có dữ liệu để tính (ví dụ: hiển thị cho người dùng)
                console.log("Calculation message from backend:", results.message);
            }
        } catch (err: any) {
            const backendError = err.response?.data?.message;
            setError(`Lỗi trong quá trình tính toán: ${backendError || err.message || 'Lỗi không xác định'}`);
            console.error("Calculate error:", err);
            setCalculationResult(null); // Xóa kết quả cũ nếu có lỗi
        } finally {
            setIsLoading(false);
        }
    };
    
    const latestVanSau = inputData.length > 0 ? inputData[inputData.length - 1][1] : null;

    // Hiển thị loading toàn trang chỉ khi tải dữ liệu ban đầu
    if (isLoadingData) {
        return <div className="loading-spinner full-page-spinner">Đang tải dữ liệu lịch sử...</div>;
    }

    return (
        <div className="container">
            <div className="theme-toggle-container">
                <button onClick={toggleTheme} className="theme-toggle-button" aria-label="Toggle theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="main-content">
                <section className="data-management">
                    <DataInputForm 
                        onAddData={handleAddData}
                        onCalculate={handleCalculate}
                        onDeleteAll={handleDeleteAll}
                        isProcessing={isLoading} // Chỉ truyền `isLoading` cho form
                        hasData={inputData.length > 0}
                    />
                    <DataTable 
                        data={inputData} 
                        isOpen={isHistoryOpen}
                        onToggle={toggleHistoryTable}
                        latestVanSau={latestVanSau}
                    />
                </section>

                <section className="results-section">
                    {/* Hiển thị loading cho việc tính toán */}
                    {isLoading && !isLoadingData && <div className="loading-spinner">Đang phân tích kết quả...</div>}
                    
                    {/* Chỉ hiển thị kết quả nếu không loading và có calculationResult */}
                    {!isLoading && calculationResult && calculationResult.total_data_count > 0 && (
                        <>
                            <ResultsDisplay results={calculationResult} />
                            {calculationResult.top_mappings_details && calculationResult.top_mappings_details.length > 0 && (
                                <TopMappingsDisplay 
                                    topMappings={calculationResult.top_mappings_details}
                                    totalDataCount={calculationResult.total_data_count}
                                />
                            )}
                        </>
                    )}
                    {/* Hiển thị thông báo từ backend nếu không có data để tính */}
                    {!isLoading && calculationResult && calculationResult.message && calculationResult.total_data_count === 0 && (
                         <p className="info-message">{calculationResult.message}</p>
                    )}
                     {/* Thông báo khi chưa tính toán nhưng có data */}
                     {!isLoading && !calculationResult && !error && inputData.length > 0 && (
                        <p className="info-message">Nhấn "Tính Toán" để xem kết quả phân tích.</p>
                    )}
                     {/* Thông báo khi chưa có data */}
                     {!isLoading && !calculationResult && !error && inputData.length === 0 && (
                        <p className="info-message">Vui lòng thêm dữ liệu lịch sử để bắt đầu.</p>
                    )}
                </section>
            </div>
            <footer>
                <p>Một sản phẩm demo - Vui lòng sử dụng có trách nhiệm.</p>
            </footer>
        </div>
    );
}

export default App;