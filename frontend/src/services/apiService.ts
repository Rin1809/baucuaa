// frontend/src/services/apiService.ts
import axios from 'axios';
import { VanEntry, CalculationResult } from '../types';

// Use VITE_API_BASE_URL from .env files for development/build-time configuration,
// and provide a fallback for local development if the .env variable is not set.
// Railway will inject VITE_API_BASE_URL as an environment variable during its build process for the frontend service.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const fetchData = async (): Promise<VanEntry[]> => {
    try {
        const response = await axios.get<VanEntry[]>(`${API_BASE_URL}/data`);
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        // Re-throw the error or handle it as per your application's error handling strategy
        // For example, you might want to throw a more specific error or a user-friendly message.
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to fetch data: ${error.response.data.message || error.message}`);
        }
        throw new Error(`Failed to fetch data: ${(error as Error).message || 'Unknown error'}`);
    }
};

export const addDataEntry = async (van_truoc: string, van_sau: string): Promise<{ message: string, data: VanEntry[] }> => {
    try {
        const response = await axios.post<{ message: string, data: VanEntry[] }>(`${API_BASE_URL}/data`, { van_truoc, van_sau });
        return response.data;
    } catch (error) {
        console.error("Error adding data entry:", error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to add data: ${error.response.data.message || error.message}`);
        }
        throw new Error(`Failed to add data: ${(error as Error).message || 'Unknown error'}`);
    }
};

export const deleteAllData = async (): Promise<{ message: string }> => {
    try {
        const response = await axios.delete<{ message: string }>(`${API_BASE_URL}/data`);
        return response.data;
    } catch (error) {
        console.error("Error deleting all data:", error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to delete data: ${error.response.data.message || error.message}`);
        }
        throw new Error(`Failed to delete data: ${(error as Error).message || 'Unknown error'}`);
    }
};

export const calculateResults = async (): Promise<CalculationResult> => {
    try {
        const response = await axios.post<CalculationResult>(`${API_BASE_URL}/calculate`);
        return response.data;
    } catch (error) {
        console.error("Error calculating results:", error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Failed to calculate results: ${error.response.data.message || error.message}`);
        }
        throw new Error(`Failed to calculate results: ${(error as Error).message || 'Unknown error'}`);
    }
};