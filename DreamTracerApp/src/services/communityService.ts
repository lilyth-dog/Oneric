/**
 * 커뮤니티 서비스
 * 백엔드 API와 프론트엔드 UI 모델 간의 매핑 담당
 */
import apiClient from './apiClient';

export interface FeedItem {
    id: string;
    author: string;
    title: string;
    content: string;
    tags: string[];
    likes: number;
    comments: number;
    imageUrl?: string;
    createdAt: string;
}

export interface CommunityPostListResponse {
    posts: any[];
    total_count: number;
    has_next: boolean;
}

class CommunityService {
    /**
     * 커뮤니티 포스트 생성
     */
    async createPost(postData: { content: string; tags?: string[]; is_anonymous?: boolean; dream_id?: string }): Promise<any> {
        return apiClient.request<any>('/community/posts', {
            method: 'POST',
            body: JSON.stringify(postData),
        });
    }

    /**
     * 커뮤니티 포스트 목록 조회
     */
    async getPosts(skip: number = 0, limit: number = 20): Promise<FeedItem[]> {
        const data = await apiClient.request<CommunityPostListResponse>(
            `/community/posts?skip=${skip}&limit=${limit}`,
            { method: 'GET' }
        );

        // Backend response mapping to UI model
        return data.posts.map((post: any) => ({
            id: post.id,
            author: post.user?.name || (post.is_anonymous ? '익명' : 'Unknown'),
            title: this.generateTitle(post.content),
            content: post.content,
            tags: post.tags || [],
            likes: Math.floor(Math.random() * 50), // Mock data as backend doesn't support it yet
            comments: Math.floor(Math.random() * 10), // Mock data
            imageUrl: post.dream_id ? 'https://via.placeholder.com/150' : undefined, // Placeholder if dream attached
            createdAt: post.created_at,
        }));
    }

    private generateTitle(content: string): string {
        const firstLine = content.split('\n')[0];
        return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine;
    }
}

export default new CommunityService();
