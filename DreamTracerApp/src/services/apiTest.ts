/**
 * API Test Service
 * Helper service for verifying connectivity and API functionality
 */
import apiClient from './apiClient';

interface TestResult {
    success: boolean;
    message: string;
    data?: any;
}

export const APITestService = {
    /**
     * Test server health
     */
    async testServerHealth(): Promise<TestResult> {
        try {
            await apiClient.request('/health', { method: 'GET' });
            return {
                success: true,
                message: '서버가 정상적으로 응답하고 있습니다.',
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
            };
        }
    },

    /**
     * Test available AI models
     */
    async testAvailableModels(): Promise<TestResult> {
        try {
            const data = await apiClient.request('/ai/models', { method: 'GET' });
            return {
                success: true,
                message: '사용 가능한 모델 목록을 성공적으로 가져왔습니다.',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : '모델 목록 조회 중 오류가 발생했습니다.',
            };
        }
    },

    /**
     * Test dream analysis (Simulated or real)
     */
    async testDreamAnalysis(): Promise<TestResult> {
        try {
            const testDream = {
                dream_text: '하늘을 날아다니는 시원한 꿈을 꾸었습니다.',
                model: 'llama-3-8b',
                language: 'ko',
            };

            const data = await apiClient.request('/ai/analyze', {
                method: 'POST',
                body: JSON.stringify(testDream),
            });

            return {
                success: true,
                message: '꿈 분석 요청이 성공적으로 처리되었습니다.',
                data,
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : '꿈 분석 중 오류가 발생했습니다.',
            };
        }
    },

    /**
     * Run full API test suite
     */
    async runFullTest(): Promise<{
        serverHealth?: TestResult;
        availableModels?: TestResult;
        dreamAnalysis?: TestResult;
        overallSuccess: boolean;
    }> {
        const serverHealth = await this.testServerHealth();
        const availableModels = serverHealth.success ? await this.testAvailableModels() : undefined;
        const dreamAnalysis = serverHealth.success ? await this.testDreamAnalysis() : undefined;

        return {
            serverHealth,
            availableModels,
            dreamAnalysis,
            overallSuccess: serverHealth.success &&
                (availableModels?.success ?? false) &&
                (dreamAnalysis?.success ?? false),
        };
    }
};
