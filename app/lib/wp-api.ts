// WordPress REST API client utilities

import axios, { AxiosInstance } from 'axios';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://staging.neck-tontechnik.com/wp-json/wp/v2';

export class WordPressAPI {
  private client: AxiosInstance;
  private authToken?: string;

  constructor(authToken?: string) {
    this.authToken = authToken;
    this.client = axios.create({
      baseURL: WORDPRESS_API_URL,
      timeout: 60000, // 60 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && {
          'Authorization': `Basic ${authToken}`,
        }),
      },
    });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    this.client.defaults.headers['Authorization'] = `Basic ${token}`;
  }

  // Authentication
  async verifyCredentials(username: string, password: string): Promise<{ user: any; token: string } | null> {
    try {
      const token = Buffer.from(`${username}:${password}`).toString('base64');
      const response = await axios.get(`${WORDPRESS_API_URL}/users/me`, {
        headers: {
          'Authorization': `Basic ${token}`,
        },
      });

      if (response.data && response.data.id) {
        return {
          user: response.data,
          token,
        };
      }
      return null;
    } catch (error: any) {
      // Log detailed error for debugging
      if (error.response) {
        console.error('WordPress auth error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('WordPress auth error - no response:', error.request);
      } else {
        console.error('WordPress auth error:', error.message);
      }
      return null;
    }
  }

  // Generic post operations
  async getPosts(postType: string, params?: Record<string, any>) {
    const response = await this.client.get(`/${postType}`, { params });
    return response.data;
  }

  async getPost(postType: string, id: number) {
    const response = await this.client.get(`/${postType}/${id}`);
    return response.data;
  }

  async createPost(postType: string, data: Record<string, any>) {
    const response = await this.client.post(`/${postType}`, data);
    return response.data;
  }

  async updatePost(postType: string, id: number, data: Record<string, any>, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.client.post(`/${postType}/${id}`, data, {
          timeout: 60000, // 60 seconds per attempt
        });
        return response.data;
      } catch (error: any) {
        // Retry on connection errors or timeouts
        const isRetryable = error.code === 'ECONNRESET' || 
                           error.code === 'ETIMEDOUT' || 
                           error.code === 'ECONNREFUSED' ||
                           (error.response?.status >= 500 && error.response?.status < 600);
        
        if (isRetryable && attempt < retries) {
          console.log(`Retrying updatePost (attempt ${attempt + 1}/${retries})...`);
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        // If not retryable or out of retries, throw the error
        throw error;
      }
    }
    throw new Error('Failed to update post after retries');
  }

  async deletePost(postType: string, id: number, force = true) {
    const response = await this.client.delete(`/${postType}/${id}`, {
      params: { force },
    });
    return response.data;
  }

  // Media operations
  async uploadMedia(file: File | Blob, filename: string, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file, filename);

    const response = await this.client.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  async getMedia(id?: number) {
    if (id) {
      const response = await this.client.get(`/media/${id}`);
      return response.data;
    }
    const response = await this.client.get('/media', { params: { per_page: 100 } });
    return response.data;
  }

  async deleteMedia(id: number, force = true) {
    const response = await this.client.delete(`/media/${id}`, { params: { force } });
    return response.data;
  }

  // ACF field operations (via meta)
  async updateACFFields(postType: string, id: number, acfFields: Record<string, any>) {
    // ACF fields are typically stored in meta or via ACF REST API
    // This depends on how ACF is configured
    const response = await this.client.post(`/${postType}/${id}`, {
      meta: acfFields,
    });
    return response.data;
  }

  // Update ACF fields via ACF REST API
  async updateACFViaREST(postId: number, fields: Record<string, any>) {
    // ACF REST API endpoint is at /wp-json/acf/v3/posts/{id}
    // But since we're using baseURL, we need to use the full path or adjust
    const baseUrl = WORDPRESS_API_URL.replace('/wp/v2', '');
    const response = await axios.post(
      `${baseUrl}/acf/v3/posts/${postId}`,
      { fields },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && {
            'Authorization': `Basic ${this.authToken}`,
          }),
        },
      }
    );
    return response.data;
  }

  // Equipment-specific operations
  async updateEquipmentMeta(id: number, meta: Record<string, any>) {
    const response = await this.client.post(`/gear/${id}`, {
      meta,
    });
    return response.data;
  }

  // Categories/Taxonomies
  async getCategories(taxonomy: string) {
    const response = await this.client.get(`/${taxonomy}`, { params: { per_page: 100 } });
    return response.data;
  }

  // WordPress Options (via custom endpoint or meta)
  // Note: WordPress REST API doesn't have built-in options endpoint
  // We'll use a special post or custom endpoint
  async getOption(optionName: string) {
    // Try to get from a special settings post first
    // If that doesn't work, we'll need a custom WordPress endpoint
    try {
      const baseUrl = WORDPRESS_API_URL.replace('/wp/v2', '');
      const response = await axios.get(`${baseUrl}/options/${optionName}`, {
        headers: {
          ...(this.authToken && {
            'Authorization': `Basic ${this.authToken}`,
          }),
        },
      });
      return response.data;
    } catch (error: any) {
      // If custom endpoint doesn't exist, try getting from a settings post
      // For now, we'll use meta on a special post
      console.log('Options endpoint not available, using fallback');
      return null;
    }
  }

  async updateOption(optionName: string, value: any) {
    // Try custom endpoint first
    try {
      const baseUrl = WORDPRESS_API_URL.replace('/wp/v2', '');
      const response = await axios.post(
        `${baseUrl}/options/${optionName}`,
        { value },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken && {
              'Authorization': `Basic ${this.authToken}`,
            }),
          },
        }
      );
      return response.data;
    } catch (error: any) {
      // Fallback: store as meta on a special settings post
      // We'll create/update a post with slug 'homepage-settings'
      console.log('Options endpoint not available, using settings post fallback');
      throw error;
    }
  }

  // Get or create a settings post for storing options
  async getSettingsPost() {
    try {
      // Try to find existing settings post by slug
      const posts = await this.getPosts('post', { slug: 'homepage-settings', per_page: 1 });
      if (posts && Array.isArray(posts) && posts.length > 0) {
        return posts[0];
      }
      
      // If not found, try to find by title
      const allPosts = await this.getPosts('post', { search: 'Homepage Settings', per_page: 10 });
      const settingsPost = allPosts.find((p: any) => p.title?.rendered === 'Homepage Settings' || p.slug === 'homepage-settings');
      if (settingsPost) {
        return settingsPost;
      }
      
      // Create settings post if it doesn't exist
      const newPost = await this.createPost('post', {
        title: 'Homepage Settings',
        slug: 'homepage-settings',
        status: 'private',
        content: 'Internal settings post for homepage configuration',
      });
      return newPost;
    } catch (error: any) {
      console.error('Error getting settings post:', error);
      // If we can't create/get the post, throw a more descriptive error
      throw new Error(`Failed to get or create settings post: ${error.message}`);
    }
  }

  // Store option as meta on settings post
  async setOptionViaMeta(optionName: string, value: any) {
    const settingsPost = await this.getSettingsPost();
    const currentPost = await this.getPost('post', settingsPost.id);
    const existingMeta = currentPost.meta || {};
    
    // Merge with existing meta to preserve other options
    await this.updatePost('post', settingsPost.id, {
      meta: {
        ...existingMeta,
        [optionName]: value,
      },
    });
    return value;
  }

  // Get option from meta on settings post
  async getOptionViaMeta(optionName: string) {
    try {
      const settingsPost = await this.getSettingsPost();
      const post = await this.getPost('post', settingsPost.id);
      return post.meta?.[optionName] || null;
    } catch (error) {
      console.error('Error getting option from meta:', error);
      return null;
    }
  }
}

export const wpApi = new WordPressAPI();

