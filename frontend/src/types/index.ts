// frontend/src/types/index.ts
export interface VanEntry extends Array<string> {} 

export interface Mapping {
    [animal: string]: number;
}

export interface DetailedResultItem {
    van_so: number;
    van_truoc: string;
    van_sau: string;
    predicted_animal: string;
    result_value: number;
    is_correct: boolean;
    mapping_values: (number | string)[];
    lo: number;
    total: number;
    total_plus_lo: number;
}

export interface Prediction {
    van_sau: string;
    predicted_animal: string;
    result_value: number;
    mapping_values: (number | string)[];
    lo: number;
    total: number;
    total_plus_lo: number;
}

export interface TopMappingDetail {
    mapping: Mapping;
    lo: number;
    correct_count: number;
    prediction: Prediction | null;
}

export interface CalculationResult {
    best_mapping: Mapping;
    best_lo: number | null;
    max_correct_count: number;
    detailed_results: DetailedResultItem[];
    total_combinations: number;
    elapsed_time: number;
    next_prediction: Prediction | null;
    perfect_match: boolean;
    input_data_raw: VanEntry[];
    formatted_input_data: Array<[string, string]>;
    total_data_count: number;
    message?: string; // Cho thông báo lỗi từ backend
    top_mappings_details: TopMappingDetail[];
    animal_counts: Record<string, number>;
    equal_mappings_count: number;
}

export const ANIMALS: string[] = ["tom", "cua", "ca", "ga", "bau", "nai"];