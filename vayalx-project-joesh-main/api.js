// ── VAYALX Centralized API Client, Authentication Bridge & Marketplace Connector (Phase 4) ──

(function (global) {
  const DEFAULT_API_BASE = global.location
    ? `${global.location.protocol}//${global.location.hostname}:5000/api`
    : 'http://localhost:5000/api';

  const VayalXApi = {
    baseUrl: (global.VAYALX_CONFIG && global.VAYALX_CONFIG.API_URL) || global.VAYALX_API_URL || DEFAULT_API_BASE,

    // Generic safe request wrapper with credentials (cookies) included
    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const config = {
        ...options,
        credentials: 'include', // Ensures HTTP-only authentication cookies are sent and received
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        }
      };

      // When sending FormData (e.g. multipart crop image upload), let browser set Content-Type with boundary
      if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => ({
          success: false,
          message: `HTTP Error ${response.status}: ${response.statusText}`
        }));

        if (!response.ok) {
          const err = new Error(data.message || `Request failed with status ${response.status}`);
          err.status = response.status;
          err.data = data;
          throw err;
        }

        return data;
      } catch (err) {
        if (!options.silent) {
          console.warn(`[VAYALX API Warning] ${options.method || 'GET'} ${url}:`, err.message);
        }
        throw err;
      }
    },

    // Health Check Endpoint: GET /api/health
    async checkHealth() {
      try {
        return await this.request('/health', { silent: true });
      } catch (err) {
        return {
          success: false,
          status: 'OFFLINE',
          message: 'Backend server is unreachable on ' + this.baseUrl,
          error: err.message
        };
      }
    }
  };

  // ── Centralized Authentication Client (Phase 3) ──
  const VayalXAuth = {
    // 1. User Registration -> POST /api/auth/register
    async register(userData) {
      return await VayalXApi.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    // 2. User Login -> POST /api/auth/login
    async login(identifier, password, expectedRole = null) {
      return await VayalXApi.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          password,
          expectedRole
        })
      });
    },

    // 3. Current Authenticated Session -> GET /api/auth/me
    async getMe() {
      return await VayalXApi.request('/auth/me', {
        method: 'GET',
        silent: true
      });
    },

    // 4. Logout -> POST /api/auth/logout
    async logout() {
      try {
        await VayalXApi.request('/auth/logout', { method: 'POST' });
      } finally {
        localStorage.removeItem('vayalx_user');
        localStorage.removeItem('vayalx_buyer_user');
        localStorage.removeItem('vayalx_supplier_user');
        localStorage.removeItem('vayalxRole');
      }
    },

    // 5. Seamless Fast-Track Persona Login for Hackathon Evaluators
    async fastTrackLogin(personaData) {
      const { email, mobile, password = 'DemoPassword123!', role, name, ...profileProps } = personaData;
      const identifier = email || mobile;

      try {
        return await this.login(identifier, password, role);
      } catch (err) {
        if (err.status === 401 || err.status === 404 || (err.message && err.message.includes('Invalid email'))) {
          return await this.register({
            name: name || 'VAYALX Member',
            email: email || `${role}.${Date.now()}@vayalx.demo`,
            mobile: mobile || `98${Math.floor(10000000 + Math.random() * 90000000)}`,
            password,
            role,
            ...profileProps
          });
        }
        throw err;
      }
    },

    getDashboardUrlForRole(role) {
      switch (role) {
        case 'buyer':
          return 'buyer-dashboard.html';
        case 'supplier':
          return 'supplier-dashboard.html';
        case 'farmer':
        default:
          return 'dashboard.html';
      }
    }
  };

  // ── Centralized Marketplace & Domain Connector (Phase 4) ──
  const VayalXMarketplace = {
    // ── 1. Crop Listings ──
    listings: {
      async create(listingData) {
        return await VayalXApi.request('/listings', {
          method: 'POST',
          body: JSON.stringify(listingData)
        });
      },
      async getMarketplace(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/listings${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/listings/my${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getById(id) {
        return await VayalXApi.request(`/listings/${id}`, { method: 'GET' });
      },
      async update(id, updateData) {
        return await VayalXApi.request(`/listings/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        });
      },
      async delete(id) {
        return await VayalXApi.request(`/listings/${id}`, { method: 'DELETE' });
      }
    },

    // ── 2. Purchase Orders ──
    orders: {
      async create(orderData) {
        return await VayalXApi.request('/orders', {
          method: 'POST',
          body: JSON.stringify(orderData)
        });
      },
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/orders/my${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getReceived(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/orders/received${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getById(id) {
        return await VayalXApi.request(`/orders/${id}`, { method: 'GET' });
      },
      async accept(id, farmerNote = '') {
        return await VayalXApi.request(`/orders/${id}/accept`, {
          method: 'PATCH',
          body: JSON.stringify({ farmerNote })
        });
      },
      async reject(id, reason = '') {
        return await VayalXApi.request(`/orders/${id}/reject`, {
          method: 'PATCH',
          body: JSON.stringify({ reason })
        });
      },
      async cancel(id, reason = '') {
        return await VayalXApi.request(`/orders/${id}/cancel`, {
          method: 'PATCH',
          body: JSON.stringify({ reason })
        });
      }
    },

    // ── 3. Buyer Demands / Tenders ──
    demands: {
      async create(demandData) {
        return await VayalXApi.request('/demands', {
          method: 'POST',
          body: JSON.stringify(demandData)
        });
      },
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/demands/my${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getOpen(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/demands/open${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async cancel(id) {
        return await VayalXApi.request(`/demands/${id}/cancel`, { method: 'PATCH' });
      }
    },

    // ── 4. Machinery & Equipment Fleet ──
    equipment: {
      async create(equipmentData) {
        return await VayalXApi.request('/equipment', {
          method: 'POST',
          body: JSON.stringify(equipmentData)
        });
      },
      async getMarketplace(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/equipment${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/equipment/my${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getById(id) {
        return await VayalXApi.request(`/equipment/${id}`, { method: 'GET' });
      },
      async update(id, updateData) {
        return await VayalXApi.request(`/equipment/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        });
      },
      async delete(id) {
        return await VayalXApi.request(`/equipment/${id}`, { method: 'DELETE' });
      }
    },

    // ── 5. Equipment Bookings ──
    bookings: {
      async create(bookingData) {
        return await VayalXApi.request('/bookings', {
          method: 'POST',
          body: JSON.stringify(bookingData)
        });
      },
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/bookings/my${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getSupplierBookings(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/bookings/supplier${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getById(id) {
        return await VayalXApi.request(`/bookings/${id}`, { method: 'GET' });
      },
      async accept(id) {
        return await VayalXApi.request(`/bookings/${id}/accept`, { method: 'PATCH' });
      },
      async reject(id, reason = '') {
        return await VayalXApi.request(`/bookings/${id}/reject`, {
          method: 'PATCH',
          body: JSON.stringify({ reason })
        });
      },
      async cancel(id) {
        return await VayalXApi.request(`/bookings/${id}/cancel`, { method: 'PATCH' });
      }
    },

    // ── 6. Notifications ──
    notifications: {
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/notifications${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async getUnreadCount() {
        return await VayalXApi.request('/notifications/unread-count', { method: 'GET' });
      },
      async markAsRead(id) {
        return await VayalXApi.request(`/notifications/${id}/read`, { method: 'PATCH' });
      },
      async markAllAsRead() {
        return await VayalXApi.request('/notifications/read-all', { method: 'PATCH' });
      }
    },

    // ── 7. Farm Records Ledger ──
    farmRecords: {
      async create(recordData) {
        return await VayalXApi.request('/farm-records', {
          method: 'POST',
          body: JSON.stringify(recordData)
        });
      },
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/farm-records/my${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async update(id, updateData) {
        return await VayalXApi.request(`/farm-records/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        });
      },
      async delete(id) {
        return await VayalXApi.request(`/farm-records/${id}`, { method: 'DELETE' });
      }
    },

    // ── 8. Advance Harvest Pre-bookings ──
    prebookings: {
      async create(prebookingData) {
        return await VayalXApi.request('/prebookings', {
          method: 'POST',
          body: JSON.stringify(prebookingData)
        });
      },
      async getMy(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/prebookings/my${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async cancel(id) {
        return await VayalXApi.request(`/prebookings/${id}/cancel`, { method: 'PATCH' });
      }
    },

    // ── 9. Community Forum ──
    community: {
      async getPosts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await VayalXApi.request(`/community${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async createPost(postData) {
        return await VayalXApi.request('/community', {
          method: 'POST',
          body: JSON.stringify(postData)
        });
      },
      async addComment(postId, comment) {
        return await VayalXApi.request(`/community/${postId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ comment })
        });
      },
      async toggleLike(postId) {
        return await VayalXApi.request(`/community/${postId}/like`, { method: 'POST' });
      },
      async deletePost(postId) {
        return await VayalXApi.request(`/community/${postId}`, { method: 'DELETE' });
      }
    },

    // ── 10. Dashboard KPIs & Market Data ──
    dashboards: {
      async getFarmerSummary() {
        return await VayalXApi.request('/farmers/dashboard', { method: 'GET' });
      },
      async getBuyerSummary() {
        return await VayalXApi.request('/buyers/dashboard', { method: 'GET' });
      },
      async getSupplierSummary() {
        return await VayalXApi.request('/suppliers/dashboard', { method: 'GET' });
      },
      async getDailyMandiRates(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return await VayalXApi.request(`/market/prices${query ? '?'+query : ''}`, { method: 'GET' });
      }
    },

    // ── 11. Real AI Pathology & Advisory Engine (Phase 5: Gemini AI) ──
    ai: {
      async diagnose(formData) {
        return await VayalXApi.request('/ai/diagnose', {
          method: 'POST',
          body: formData
        });
      },
      async chat(chatData) {
        return await VayalXApi.request('/ai/chat', {
          method: 'POST',
          body: JSON.stringify(chatData)
        });
      }
    }
  };

  // Background Initialization: Health & Session check
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        const health = await VayalXApi.checkHealth();
        if (health.success) {
          console.log(
            `%c[VAYALX]%c Backend Connected (Status: ${health.data?.status || 'OK'}, DB: ${health.data?.database || 'standby'})`,
            'background: #2d6a4f; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
            'color: #2d6a4f; font-weight: bold;'
          );
        }

        const session = await VayalXAuth.getMe().catch(() => null);
        if (session && session.success && session.data?.user) {
          console.log(
            `%c[VAYALX AUTH]%c Active Session: ${session.data.user.name} (${session.data.user.role.toUpperCase()})`,
            'background: #0284c7; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
            'color: #0284c7; font-weight: bold;'
          );
        }
      } catch {
        // Silent catch
      }
    });
  }

  global.VayalXApi = VayalXApi;
  global.VayalXAuth = VayalXAuth;
  global.VayalXMarketplace = VayalXMarketplace;
})(typeof window !== 'undefined' ? window : global);
