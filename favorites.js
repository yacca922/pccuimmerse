// 收藏功能核心代碼
document.addEventListener('DOMContentLoaded', function() {
    // 獲取當前頁面類型（樂團或音樂祭）和名稱
    const isBandPage = document.body.classList.contains('band-page');
    const isFestivalPage = document.body.classList.contains('festival-page');
    const itemName = document.getElementById('item-name').textContent; // 假設您有一個顯示名稱的元素
    
    if (!isBandPage && !isFestivalPage) return;
    
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) return;
    
    // 初始化收藏按鈕狀態
    updateFavoriteButton(itemName, isBandPage);
    
    // 點擊收藏按鈕事件
    favoriteBtn.addEventListener('click', function() {
        toggleFavorite(itemName, isBandPage);
        updateFavoriteButton(itemName, isBandPage);
    });
});

// 切換收藏狀態
function toggleFavorite(itemName, isBand) {
    const storageKey = isBand ? 'favoriteBands' : 'favoriteFestivals';
    let favorites = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const index = favorites.indexOf(itemName);
    if (index === -1) {
        favorites.push(itemName);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(favorites));
}

// 更新收藏按鈕顯示
function updateFavoriteButton(itemName, isBand) {
    const storageKey = isBand ? 'favoriteBands' : 'favoriteFestivals';
    const favorites = JSON.parse(localStorage.getItem(storageKey)) || [];
    const favoriteBtn = document.getElementById('favorite-btn');
    
    if (favorites.includes(itemName)) {
        favoriteBtn.textContent = '❤️ 已收藏';
        favoriteBtn.classList.add('favorited');
    } else {
        favoriteBtn.textContent = '❤️ 收藏';
        favoriteBtn.classList.remove('favorited');
    }
}

// 樂團版本
itemElement.addEventListener('click', () => {
    const pageUrl = bandPageMap[band] || 'default-band.html';
    window.location.href = pageUrl;
});

// 音樂祭版本
itemElement.addEventListener('click', () => {
    const pageUrl = festivalPageMap[festival] || 'default-festival.html';
    window.location.href = pageUrl;
});
// 在 loadBands() 函數內加入：
favorites.forEach(band => {
    const pageUrl = bandPageMap[band] || 'default-band.html';
    
    // 測試連結是否有效
    fetch(pageUrl)
        .then(response => {
            if (!response.ok) {
                console.error(`檔案不存在: ${pageUrl} (狀態碼: ${response.status})`);
            }
        })
        .catch(error => {
            console.error(`無法載入 ${pageUrl}:`, error);
        });
});