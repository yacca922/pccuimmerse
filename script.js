// 樂團資料庫
const bandsDatabase = {
    "草東沒有派對": {
        image: "images/草東沒有派對.jpg",
        description: "最早開始時的團名為「草東街左轉」，後改為「草東街派對」。團名來源「草東街」是位於台北陽明山的街道名。是一支臺灣的獨立搖滾樂團，成立於2012年6月9日，現由巫堵（主唱和吉他）、筑筑（吉他）、鳥人（鼓手）及Dennis（貝斯）四人組成。後繼部分成員離開的陣容變動後，2014年，留下的團員決定以「草東沒有派對」這個團名繼續音樂旅程，並邀請FUBAR（現deca joins）的成員鄭敬儒（Sam）和劉立擔任貝斯和鼓手的位置。"
    },
    "溫蒂漫步": {
        image: "images/溫蒂漫步.jpg",
        description: "溫蒂漫步的樂團介紹..."
    },
    "嚴先生": {
        image: "images/嚴先生.jpg",
        description: "嚴先生的樂團介紹..."
    },
    "閃閃閃閃": {
        image: "images/閃閃閃閃.jpg",
        description: "閃閃閃閃的樂團介紹..."
    }
};

// 載入樂團資訊
function loadBandInfo(bandName) {
    const bandInfo = bandsDatabase[bandName];
    if (bandInfo) {
        document.getElementById('band-image').src = bandInfo.image;
        document.getElementById('band-description').textContent = bandInfo.description;
    }
}

// 檢查收藏狀態
function checkFavoriteStatus(bandName) {
    const favorites = JSON.parse(localStorage.getItem('favoriteBands')) || [];
    const favoriteBtn = document.getElementById('favorite-btn');
    
    if (favorites.includes(bandName)) {
        favoriteBtn.textContent = '❤️ 已收藏';
        favoriteBtn.classList.add('favorited');
    } else {
        favoriteBtn.textContent = '❤️ 收藏';
        favoriteBtn.classList.remove('favorited');
    }
}

// 切換收藏狀態
function toggleFavorite(bandName) {
    let favorites = JSON.parse(localStorage.getItem('favoriteBands')) || [];
    const favoriteBtn = document.getElementById('favorite-btn');
    
    if (favorites.includes(bandName)) {
        // 如果已收藏，則移除
        favorites = favorites.filter(band => band !== bandName);
        favoriteBtn.textContent = '❤️ 收藏';
        favoriteBtn.classList.remove('favorited');
    } else {
        // 如果未收藏，則加入
        favorites.push(bandName);
        favoriteBtn.textContent = '❤️ 已收藏';
        favoriteBtn.classList.add('favorited');
    }
    
    localStorage.setItem('favoriteBands', JSON.stringify(favorites));
}

// 顯示收藏的樂團
function displayFavoriteBands() {
    const favorites = JSON.parse(localStorage.getItem('favoriteBands')) || [];
    const container = document.getElementById('favorite-bands');
    
    container.innerHTML = '';
    
    if (favorites.length === 0) {
        container.innerHTML = '<p>您尚未收藏任何樂團</p>';
        return;
    }
    
    favorites.forEach(bandName => {
        const bandInfo = bandsDatabase[bandName];
        if (bandInfo) {
            const bandElement = document.createElement('div');
            bandElement.className = 'band-avatar';
            bandElement.innerHTML = `
                <img src="${bandInfo.image}" alt="${bandName}">
                <p>${bandName}</p>
            `;
            bandElement.addEventListener('click', () => {
                window.location.href = `band.html?band=${encodeURIComponent(bandName)}`;
            });
            container.appendChild(bandElement);
        }
    });
}
// 音樂祭頁面的收藏功能
function toggleFavorite() {
    const festivalName = "雨山祭"; // 替換為動態獲取的音樂祭名稱
    let favorites = JSON.parse(localStorage.getItem('favoriteFestivals')) || [];
    
    if (!favorites.includes(festivalName)) {
      favorites.push(festivalName);
      localStorage.setItem('favoriteFestivals', JSON.stringify(favorites));
    } else {
      favorites = favorites.filter(item => item !== festivalName);
      localStorage.setItem('favoriteFestivals', JSON.stringify(favorites));
    }
  }
  // 樂團頁面的收藏功能（分開儲存）
function toggleFavorite() {
    const bandName = "溫蒂漫步"; // 替換為動態獲取的樂團名稱
    let favorites = JSON.parse(localStorage.getItem('favoriteBands')) || [];
    
    if (!favorites.includes(bandName)) {
      favorites.push(bandName);
      localStorage.setItem('favoriteBands', JSON.stringify(favorites));
    } else {
      favorites = favorites.filter(item => item !== bandName);
      localStorage.setItem('favoriteBands', JSON.stringify(favorites));
    }
  }