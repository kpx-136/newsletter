import axios from 'axios';

const API_URL = 'http://localhost:8080';

export interface Comment {
    id: string;
    article_id: string;
    author_name?: string | null;
    content: string;
}

export interface CreateCommentRequest {
    author_name?: string | null;
    content: string;
}

export const getComments = async (
    articleId: string
): Promise<Comment[]> => {
    const response = await axios.get(
        `${API_URL}/articles/${articleId}/comments`
    );

    return response.data;
};

export const createComment = async (
    articleId: string,
    data: CreateCommentRequest
): Promise<Comment> => {
    const response = await axios.post(
        `${API_URL}/articles/${articleId}/comments`,
        data
    );

    return response.data;
};