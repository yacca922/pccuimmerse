// IndexedDB 資料庫操作工具
const dbPromise = (() => {
    const dbName = 'MusicFestivalDB';
    const dbVersion = 3; // 版本號增加以支援圖片
    
    return {
        async init() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, dbVersion);
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    if (!db.objectStoreNames.contains('posts')) {
                        const postsStore = db.createObjectStore('posts', { 
                            keyPath: 'id',
                            autoIncrement: true 
                            
                        });
                        // 建立索引以便查詢
                        postsStore.createIndex('author', 'author', { unique: false });
                        postsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    } else {
                        // 如果已存在 posts store，檢查是否需要升級
                        const postsStore = event.target.transaction.objectStore('posts');
                        if (!postsStore.indexNames.contains('image')) {
                            // 添加圖片支援
                            db.deleteObjectStore('posts');
                            const newPostsStore = db.createObjectStore('posts', { 
                                keyPath: 'id',
                                autoIncrement: true 
                            });
                            newPostsStore.createIndex('author', 'author', { unique: false });
                            newPostsStore.createIndex('timestamp', 'timestamp', { unique: false });
                        }
                    }
                    
                    if (!db.objectStoreNames.contains('users')) {
                        db.createObjectStore('users', {
                            keyPath: 'id'
                        });
                    }
                };
                
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => {
                    console.error('資料庫錯誤:', event.target.error);
                    reject(event.target.error);
                };
            });
        },
        
        async getAll(storeName) {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
            });
        },
        
        async add(storeName, data) {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.add(data);
                
                request.onsuccess = () => resolve();
            });
        },
        
        async delete(storeName, id) {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);
                
                request.onsuccess = () => resolve();
            });
        }
    };
})();

// 用戶管理
const userManager = (() => {
    let currentUser = sessionStorage.getItem('currentUser') || null;
    
    return {
        getCurrentUser() {
            return currentUser;
        },
        
        async login() {
            const username = prompt('請輸入您的暱稱:');
            if (username && username.trim()) {
                currentUser = username.trim();
                sessionStorage.setItem('currentUser', currentUser);
                document.getElementById('current-user').textContent = currentUser;
                
                // 儲存用戶到 IndexedDB
                await dbPromise.add('users', {
                    id: Date.now().toString(),
                    name: currentUser,
                    lastActive: new Date().toISOString()
                });
                
                return true;
            }
            return false;
        },
        
        logout() {
            currentUser = null;
            sessionStorage.removeItem('currentUser');
            document.getElementById('current-user').textContent = '訪客';
        }
    };
})();

// 貼文管理
const postManager = (() => {
    return {
        async createPost(content, imageData) {
            if (!content.trim()) return false;
            
            const user = userManager.getCurrentUser();
            if (!user) {
                alert('請先登入才能發文');
                return false;
            }
            
            await dbPromise.add('posts', {
                content: content.trim(),
                author: user,
                timestamp: new Date().toISOString(),
                likes: 0,
                image: imageData || null
            });
            
            return true;
        },
        
        async deletePost(postId) {
            await dbPromise.delete('posts', postId);
        },
        
        async renderPosts() {
            const postsContainer = document.getElementById('posts-container');
            const posts = await dbPromise.getAll('posts');
            const currentUser = userManager.getCurrentUser();
            
            postsContainer.innerHTML = '';
            
            if (posts.length === 0) {
                postsContainer.innerHTML = `
                    <div class="post-card">
                        <p style="text-align: center; color: #666;">
                            還沒有任何貼文，成為第一個發文的人吧！
                        </p>
                    </div>
                `;
                return;
            }
            
            // 按時間降序排列
            posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post-card';
                postElement.innerHTML = `
                    <div class="post-header">
                        <span>👤 ${post.author}</span>
                        <span>${new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${post.image ? `<img src="${post.image}" class="post-image" alt="貼文圖片">` : ''}
                    <div class="post-footer">
                        <button class="delete-button" 
                                ${post.author !== currentUser ? 'disabled style="opacity: 0.5"' : ''}
                                data-id="${post.id}">
                            ${post.author === currentUser ? '刪除' : ''}
                        </button>
                    </div>
                `;
                postsContainer.appendChild(postElement);
            });
            
            // 添加刪除事件監聽
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    if (confirm('確定要刪除此貼文嗎？')) {
                        await this.deletePost(parseInt(e.target.dataset.id));
                        await this.renderPosts();
                    }
                });
            });
        }
    };
})();

// 初始化應用
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化用戶顯示
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        document.getElementById('current-user').textContent = currentUser;
        document.getElementById('login-button').textContent = '登出';
    }
    
    // 登入按鈕事件
    document.getElementById('login-button').addEventListener('click', async () => {
        if (userManager.getCurrentUser()) {
            userManager.logout();
            document.getElementById('login-button').textContent = '登入';
        } else {
            const success = await userManager.login();
            if (success) {
                document.getElementById('login-button').textContent = '登出';
            }
        }
    });
    
    // 圖片上傳預覽
    document.getElementById('post-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const previewContainer = document.getElementById('image-preview');
            previewContainer.innerHTML = '';
            
            const container = document.createElement('div');
            container.className = 'image-preview-container';
            
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'preview-image';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => {
                previewContainer.innerHTML = '';
                document.getElementById('post-image').value = '';
            });
            
            container.appendChild(img);
            container.appendChild(removeBtn);
            previewContainer.appendChild(container);
        };
        reader.readAsDataURL(file);
    });
    
    // 發文按鈕事件
    document.getElementById('post-submit').addEventListener('click', async () => {
        const content = document.getElementById('post-content').value;
        const imageInput = document.getElementById('post-image');
        let imageData = null;
        
        // 如果有上傳圖片，讀取圖片數據
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];
            // 限制圖片大小 (例如最大 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('圖片大小不能超過 2MB');
                return;
            }
            
            imageData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        }
        
        const success = await postManager.createPost(content, imageData);
        
        if (success) {
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            document.getElementById('image-preview').innerHTML = '';
            await postManager.renderPosts();
        }
    });
    
    // 初始渲染貼文
    await postManager.renderPosts();
    
    // 每30秒自動刷新貼文
    setInterval(async () => {
        await postManager.renderPosts();
    }, 30000);
});