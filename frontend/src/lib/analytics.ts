import axios from 'axios';

class Analytics {
  private sessionId: string;
  private pageLoadTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.pageLoadTime = Date.now();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public async trackPageView(postId: number | null = null) {
    try {
      await axios.post('/api/analytics/pageview', {
        postId,
        sessionId: this.sessionId,
        referer: document.referrer,
        duration: 0, // Initial page load
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  public async trackEngagement(postId: number, type: string) {
    try {
      await axios.post('/api/analytics/engagement', {
        postId,
        type,
        sessionId: this.sessionId,
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  public updateTimeOnPage() {
    const duration = Math.floor((Date.now() - this.pageLoadTime) / 1000);
    
    window.addEventListener('beforeunload', async () => {
      try {
        await axios.post('/api/analytics/duration', {
          sessionId: this.sessionId,
          duration,
        });
      } catch (error) {
        console.error('Error updating time on page:', error);
      }
    });
  }
}

export const analytics = new Analytics();