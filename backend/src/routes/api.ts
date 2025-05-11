// backend/src/routes/api.ts
import express, { Request, Response, Router } from 'express';
import {
    ANIMALS,
    load_data,
    save_data,
    format_input_data,
    check_mapping_detailed,
    check_mapping_all,
    predict_next_van,
    getPermutations,
    Mapping,
    TrialResult,
    DetailedResult,
    Prediction,
} from '../core/logic';

const router = Router();
let total_combinations = 0; // Biến toàn cục để theo dõi số tổ hợp

// GET current data
router.get('/data', async (req: Request, res: Response) => {
    try {
        const data = await load_data();
        res.json(data);
    } catch (error) {
        console.error("Error in GET /data:", error);
        res.status(500).json({ message: "Error loading data", error: (error as Error).message });
    }
});

// POST new data entry
router.post('/data', async (req: Request, res: Response) => {
    try {
        const { van_truoc, van_sau } = req.body;
        if (!van_truoc || !van_sau || typeof van_truoc !== 'string' || typeof van_sau !== 'string') {
            return res.status(400).json({ message: "van_truoc and van_sau are required and must be strings" });
        }
        
        const validateVan = (van: string): boolean => {
            const parts = van.split(' ');
            return parts.length === 3 && parts.every(part => ANIMALS.includes(part));
        };

        if (!validateVan(van_truoc) || !validateVan(van_sau)) {
            return res.status(400).json({ message: "Invalid format for van_truoc or van_sau. Each must contain 3 valid animals separated by spaces." });
        }

        const current_data = await load_data();
        current_data.push([van_truoc, van_sau]);
        await save_data(current_data);
        res.status(201).json({ message: "Data added successfully", data: current_data });
    } catch (error) {
        console.error("Error in POST /data:", error);
        res.status(500).json({ message: "Error saving data", error: (error as Error).message });
    }
});

// DELETE all data
router.delete('/data', async (req: Request, res: Response) => {
    try {
        await save_data([]);
        res.json({ message: "All data deleted successfully" });
    } catch (error) {
        console.error("Error in DELETE /data:", error);
        res.status(500).json({ message: "Error deleting data", error: (error as Error).message });
    }
});

// POST to calculate/brute-force
router.post('/calculate', async (req: Request, res: Response) => {
    const startTime = Date.now();
    total_combinations = 0; // Reset mỗi lần gọi
    try {
        const input_data_raw = await load_data();
        const formatted_input_data = format_input_data(input_data_raw);
        const total_data_count = formatted_input_data.length;

        const default_response = {
            best_mapping: {},
            best_lo: null,
            max_correct_count: 0,
            detailed_results: [],
            total_combinations: 0,
            elapsed_time: 0,
            next_prediction: null,
            perfect_match: false,
            top_mappings_details: [],
            animal_counts: ANIMALS.reduce((acc, animal) => ({ ...acc, [animal]: 0 }), {}),
            equal_mappings_count: 0,
            input_data_raw,
            formatted_input_data,
            total_data_count,
        };

        if (total_data_count === 0) {
            return res.json({
                ...default_response,
                message: "Không có dữ liệu đầu vào để tính toán.",
            });
        }

        let best_mapping: Mapping = {};
        let best_lo: number | null = null;
        let max_correct_count = -1;
        let detailed_results_for_best: DetailedResult[] = [];
        let perfect_match = false;
        const all_trials_results: TrialResult[] = [];

        for (const permutation of getPermutations(ANIMALS, ANIMALS.length)) { // Đảm bảo k = array.length
            const current_mapping: Mapping = permutation.reduce((obj, animal, i) => {
                obj[animal] = i;
                return obj;
            }, {} as Mapping);

            for (let lo_candidate = 1; lo_candidate <= 10; lo_candidate++) {
                total_combinations++;
                const { results, correct_count } = check_mapping_detailed(current_mapping, lo_candidate, formatted_input_data);
                const correct_list = check_mapping_all(current_mapping, lo_candidate, formatted_input_data);
                
                all_trials_results.push({
                    mapping: { ...current_mapping }, // Clone
                    lo: lo_candidate,
                    correct_count: correct_count,
                    correct_list: [...correct_list] // Clone
                });

                if (correct_count === total_data_count) { // Perfect match
                    if (!perfect_match) { // Chỉ lấy perfect match đầu tiên làm "best"
                        perfect_match = true;
                        max_correct_count = correct_count;
                        best_mapping = { ...current_mapping };
                        best_lo = lo_candidate;
                        detailed_results_for_best = [...results];
                    }
                    // Vẫn tiếp tục để all_trials_results có tất cả các perfect match
                } else if (!perfect_match && correct_count > max_correct_count) {
                    // Nếu chưa có perfect match, cập nhật best bình thường
                    max_correct_count = correct_count;
                    best_mapping = { ...current_mapping };
                    best_lo = lo_candidate;
                    detailed_results_for_best = [...results];
                }
            }
        }
        
        // Nếu không có perfect match nào, và max_correct_count vẫn là -1 (nghĩa là không có dữ liệu hoặc tất cả đều 0)
        // thì cần tìm best_mapping từ all_trials_results (nếu có)
        if (!perfect_match && max_correct_count === -1 && all_trials_results.length > 0) {
            all_trials_results.sort((a, b) => b.correct_count - a.correct_count);
            const top_trial = all_trials_results[0];
            if (top_trial) {
                max_correct_count = top_trial.correct_count;
                best_mapping = { ...top_trial.mapping };
                best_lo = top_trial.lo;
                const { results } = check_mapping_detailed(best_mapping, best_lo, formatted_input_data);
                detailed_results_for_best = [...results];
            }
        } else if (max_correct_count === -1) { // Không có data hoặc không có trial nào
            max_correct_count = 0; // Để tránh trả về -1
        }


        const elapsed_time = (Date.now() - startTime) / 1000;

        let next_prediction: Prediction | null = null;
        if (Object.keys(best_mapping).length > 0 && best_lo !== null && formatted_input_data.length > 0) {
            const last_van_sau_entry = formatted_input_data[formatted_input_data.length - 1];
            if (last_van_sau_entry && last_van_sau_entry[1]) {
                 next_prediction = predict_next_van(last_van_sau_entry[1], best_mapping, best_lo);
            }
        }

        all_trials_results.sort((a, b) => b.correct_count - a.correct_count);
        const effective_max_correct_after_sort = all_trials_results.length > 0 ? all_trials_results[0].correct_count : 0;
         
        const top_mappings_trials = all_trials_results
            .filter(trial => trial.correct_count >= Math.max(0, effective_max_correct_after_sort - 2))
            .slice(0, 9);

        const top_mappings_details = top_mappings_trials.map(trial => {
            let prediction_for_this_mapping: Prediction | null = null;
            if (formatted_input_data.length > 0) {
                const last_van_sau_entry = formatted_input_data[formatted_input_data.length - 1];
                if (last_van_sau_entry && last_van_sau_entry[1]) {
                    prediction_for_this_mapping = predict_next_van(last_van_sau_entry[1], trial.mapping, trial.lo);
                }
            }
            return {
                mapping: trial.mapping,
                lo: trial.lo,
                correct_count: trial.correct_count,
                prediction: prediction_for_this_mapping
            };
        });
        
        const equal_mappings = all_trials_results.filter(trial => trial.correct_count === effective_max_correct_after_sort);
        const equal_mappings_count = equal_mappings.length;

        const animal_counts = ANIMALS.reduce((acc, animal) => ({ ...acc, [animal]: 0 }), {} as Record<string, number>);
        if (formatted_input_data.length > 0) {
            const last_van_sau_entry = formatted_input_data[formatted_input_data.length - 1];
             if (last_van_sau_entry && last_van_sau_entry[1]) {
                const last_van_sau_str = last_van_sau_entry[1];
                equal_mappings.forEach(trial => {
                    const pred = predict_next_van(last_van_sau_str, trial.mapping, trial.lo);
                    if (pred && pred.predicted_animal && pred.predicted_animal !== "Không có" && ANIMALS.includes(pred.predicted_animal)) {
                        animal_counts[pred.predicted_animal]++;
                    }
                });
            }
        }

        res.json({
            ...default_response, // Bắt đầu với default
            best_mapping,
            best_lo,
            max_correct_count: perfect_match ? total_data_count : max_correct_count, // Đảm bảo max_correct_count là đúng nếu perfect_match
            detailed_results: detailed_results_for_best,
            total_combinations,
            elapsed_time,
            next_prediction,
            perfect_match,
            top_mappings_details,
            animal_counts,
            equal_mappings_count,
        });
    } catch (error) {
        console.error("Error in POST /calculate:", error);
        res.status(500).json({ message: "Error during calculation", error: (error as Error).message });
    }
});

export default router;