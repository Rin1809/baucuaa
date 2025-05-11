// backend/src/core/logic.ts
import fs from 'fs/promises';
import path from 'path';

export const ANIMALS: string[] = ["tom", "cua", "ca", "ga", "bau", "nai"];
export const ANIMAL_SET: Set<string> = new Set(ANIMALS);
// __dirname trỏ đến thư mục hiện tại của file logic.ts (tức là core)
// '..' đi lên một cấp (tức là src)
// Sau đó nối với 'data.json'
const DATA_FILE_PATH: string = path.join(__dirname, '..', 'data.json');

export interface InputDataEntry extends Array<string> {} // [van_truoc_str, van_sau_str]
export type FormattedData = Array<[string, string]>;

export interface Mapping {
    [animal: string]: number;
}

export interface DetailedResult {
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

export interface TrialResult {
    mapping: Mapping;
    lo: number;
    correct_count: number;
    correct_list: boolean[];
}

export async function load_data(): Promise<InputDataEntry[]> {
    try {
        const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn("Data file not found. Returning an empty list and creating the file.");
            await save_data([]);
            return [];
        }
        console.error("Error reading or parsing data.json:", error);
        return [];
    }
}

export async function save_data(data: InputDataEntry[]): Promise<void> {
    try {
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8'); // indent 2 cho gọn
    } catch (error) {
        console.error("An unexpected error occurred when saving data:", error);
    }
}

export function format_input_data(input_data: InputDataEntry[]): FormattedData {
    const formatted_data: FormattedData = [];
    for (const entry of input_data) {
        if (!Array.isArray(entry) || entry.length !== 2) {
            console.warn("Skipping invalid data entry (not an array of 2 strings):", entry);
            continue;
        }
        const [van_truoc_str, van_sau_str] = entry;
         if (typeof van_truoc_str !== 'string' || typeof van_sau_str !== 'string') {
            console.warn("Skipping invalid data entry (elements are not strings):", entry);
            continue;
        }

        const vt_parts = van_truoc_str.split(' ').map(x => x.trim()).filter(x => ANIMAL_SET.has(x));
        const vs_parts = van_sau_str.split(' ').map(x => x.trim()).filter(x => ANIMAL_SET.has(x));

        if (vt_parts.length !== 3 || vs_parts.length !== 3) {
            console.warn("Skipping invalid data entry (incorrect number of animals):", entry, vt_parts, vs_parts);
            continue;
        }
        formatted_data.push([vt_parts.join(' '), vs_parts.join(' ')]);
    }
    return formatted_data;
}

export function calculate_result_value(van_truoc: string, lo: number, mapping: Mapping): number {
    const total = van_truoc.split(' ')
        .filter(animal => animal && mapping[animal] !== undefined) // Chỉ tính con vật có trong mapping
        .reduce((sum, animal) => sum + (mapping[animal] as number), 0); // Ép kiểu mapping[animal] thành number
    return (total + lo) % 6;
}


export function check_mapping_detailed(
    mapping: Mapping,
    lo: number,
    input_data: FormattedData
): { results: DetailedResult[], correct_count: number } {
    const results: DetailedResult[] = [];
    let correct_count = 0;

    input_data.forEach(([van_truoc, van_sau], i) => {
        const result_value = calculate_result_value(van_truoc, lo, mapping);
        const predicted_animals = Object.entries(mapping)
            .filter(([_, value]) => value === result_value)
            .map(([animal]) => animal);

        const is_correct = van_sau.split(' ')
            .filter(animal => animal)
            .some(animal => predicted_animals.includes(animal));

        if (is_correct) {
            correct_count++;
        }
        const vanTruocParts = van_truoc.split(' ');
        const totalSum = vanTruocParts.reduce((sum, animal) => sum + (mapping[animal] ?? 0), 0);

        results.push({
            van_so: i + 1,
            van_truoc: van_truoc,
            van_sau: van_sau,
            predicted_animal: predicted_animals.length > 0 ? predicted_animals[0] : "Không có",
            result_value: result_value,
            is_correct: is_correct,
            mapping_values: vanTruocParts.map(a => mapping[a] ?? "N/A"),
            lo: lo,
            total: totalSum,
            total_plus_lo: totalSum + lo
        });
    });
    return { results, correct_count };
}

export function check_mapping_all(
    mapping: Mapping,
    lo: number,
    input_data: FormattedData
): boolean[] {
    const correct_list: boolean[] = [];
    for (const [van_truoc, van_sau] of input_data) {
        const result_value = calculate_result_value(van_truoc, lo, mapping);
        const predicted_animals = Object.entries(mapping)
            .filter(([_, value]) => value === result_value)
            .map(([animal]) => animal);
        const is_correct = van_sau.split(' ')
            .filter(a => a)
            .some(a => predicted_animals.includes(a));
        correct_list.push(is_correct);
    }
    return correct_list;
}

export function predict_next_van(
    last_van_sau: string,
    mapping: Mapping,
    lo: number
): Prediction | null {
    if (!last_van_sau) return null;

    const last_van_sau_animals = last_van_sau.split(' ').filter(a => ANIMAL_SET.has(a));
    if (last_van_sau_animals.length !== 3) {
        console.warn("predict_next_van: last_van_sau does not contain 3 valid animals:", last_van_sau);
        return null;
    }

    const total = last_van_sau_animals.reduce((sum, animal) => sum + (mapping[animal] ?? 0), 0);
    const total_plus_lo = total + lo;
    const result_value = total_plus_lo % 6;

    const predicted_animals = Object.entries(mapping)
        .filter(([_, value]) => value === result_value)
        .map(([animal]) => animal);

    return {
        van_sau: last_van_sau_animals.join(' '), // Trả về chuỗi đã được chuẩn hóa
        predicted_animal: predicted_animals.length > 0 ? predicted_animals[0] : "Không có",
        result_value: result_value,
        mapping_values: last_van_sau_animals.map(a => mapping[a] ?? "N/A"),
        lo: lo,
        total: total,
        total_plus_lo: total_plus_lo
    };
}

export function* getPermutations<T>(array: T[], k?: number): Generator<T[]> {
    const length = array.length;
    k = k ?? length;
    if (k > length || k <= 0) return;
    if (k === length && length === 0) { // Handle empty array for k=0 or k=length
        yield [];
        return;
    }
    if (k === 0) {
        yield [];
        return;
    }

    const indexes = Array.from({ length: k }, (_, i) => i);
    const cycles = Array.from({ length: k }, (_, i) => length - i);
    
    yield array.slice(0, k);

    while (true) {
        let i = k - 1;
        while (i >= 0) {
            cycles[i]--;
            if (cycles[i] === 0) {
                const first = indexes[i];
                for (let j = i; j < length - 1; j++) {
                    indexes[j] = indexes[j + 1];
                }
                indexes[length - 1] = first;
                cycles[i] = length - i;
            } else {
                const j = cycles[i];
                const temp = indexes[i];
                indexes[i] = indexes[length - j];
                indexes[length - j] = temp;
                yield indexes.slice(0, k).map(idx => array[idx]);
                break;
            }
            i--;
        }
        if (i < 0) break;
    }
}