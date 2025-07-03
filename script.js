
// 전역 변수
let restaurants = [];
let currentEditIndex = -1;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    setupNavigation();
    setupModalEvents();
    updateStats();
    updateFilterOptions();
    renderRestaurantList();
    updateRecommendOptions();
    
    // 새로고침 시 현재 페이지 유지
    const savedPage = localStorage.getItem('currentPage') || 'home';
    showPage(savedPage);
});

// 로컬 스토리지에서 데이터 로드
function loadDataFromStorage() {
    const savedData = localStorage.getItem('restaurants');
    if (savedData) {
        try {
            restaurants = JSON.parse(savedData);
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            restaurants = [];
        }
    }
}

// 로컬 스토리지에 데이터 저장
function saveDataToStorage() {
    try {
        localStorage.setItem('restaurants', JSON.stringify(restaurants));
    } catch (error) {
        console.error('데이터 저장 오류:', error);
        showToast('데이터 저장에 실패했습니다.', 'error');
    }
}

// 네비게이션 설정
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
            
            // 모바일에서 메뉴 닫기
            navMenu.classList.remove('active');
        });
    });

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// 페이지 표시
function showPage(pageId) {
    // 모든 페이지 숨기기
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 모든 네비게이션 링크 비활성화
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // 대상 페이지 표시
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 대상 네비게이션 링크 활성화
    const targetNavLink = document.querySelector(`[data-page="${pageId}"]`);
    if (targetNavLink) {
        targetNavLink.classList.add('active');
    }
    
    // 현재 페이지 저장
    localStorage.setItem('currentPage', pageId);
    
    // 페이지별 초기화
    if (pageId === 'manage') {
        updateFilterOptions();
        renderRestaurantList();
    } else if (pageId === 'recommend') {
        updateRecommendOptions();
    } else if (pageId === 'home') {
        updateStats();
    }
}

// 통계 업데이트
function updateStats() {
    const totalRestaurants = restaurants.length;
    const uniqueUsers = [...new Set(restaurants.map(r => r.user))].length;
    const uniqueCategories = [...new Set(restaurants.map(r => r.category))].length;
    
    document.getElementById('totalRestaurants').textContent = totalRestaurants;
    document.getElementById('totalUsers').textContent = uniqueUsers;
    document.getElementById('totalCategories').textContent = uniqueCategories;
}

// 필터 옵션 업데이트
function updateFilterOptions() {
    const users = [...new Set(restaurants.map(r => r.user))].sort();
    const types = [...new Set(restaurants.map(r => r.type))].sort();
    const categories = [...new Set(restaurants.map(r => r.category))].sort();
    
    updateSelectOptions('filterUser', users);
    updateSelectOptions('filterType', types);
    updateSelectOptions('filterCategory', categories);
}

// 추천 옵션 업데이트
function updateRecommendOptions() {
    const users = [...new Set(restaurants.map(r => r.user))].sort();
    const types = [...new Set(restaurants.map(r => r.type))].sort();
    const categories = [...new Set(restaurants.map(r => r.category))].sort();
    
    updateSelectOptions('recommendUser', users, false);
    updateSelectOptions('recommendType', types);
    updateSelectOptions('recommendCategory', categories);
}

// 셀렉트 옵션 업데이트
function updateSelectOptions(selectId, options, includeAll = true) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // 기존 옵션들 중 첫 번째(기본값) 제외하고 제거
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// 필터 적용
function applyFilters() {
    const userFilter = document.getElementById('filterUser').value;
    const typeFilter = document.getElementById('filterType').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const searchKeyword = document.getElementById('searchKeyword').value.toLowerCase();
    
    let filteredRestaurants = restaurants.filter(restaurant => {
        const matchUser = !userFilter || restaurant.user === userFilter;
        const matchType = !typeFilter || restaurant.type === typeFilter;
        const matchCategory = !categoryFilter || restaurant.category === categoryFilter;
        const matchSearch = !searchKeyword || restaurant.name.toLowerCase().includes(searchKeyword);
        
        return matchUser && matchType && matchCategory && matchSearch;
    });
    
    renderRestaurantList(filteredRestaurants);
}

// 식당 리스트 렌더링
function renderRestaurantList(filteredRestaurants = null) {
    const restaurantList = document.getElementById('restaurantList');
    const restaurantsToShow = filteredRestaurants || restaurants;
    
    if (restaurantsToShow.length === 0) {
        restaurantList.innerHTML = `
            <div class="empty-state">
                <h3>등록된 식당이 없습니다</h3>
                <p>새로운 식당을 추가해보세요!</p>
                <button class="btn btn-primary" onclick="openAddModal()">+ 식당 추가</button>
            </div>
        `;
        return;
    }
    
    restaurantList.innerHTML = restaurantsToShow.map((restaurant, index) => {
        const originalIndex = filteredRestaurants ? restaurants.indexOf(restaurant) : index;
        return `
            <div class="restaurant-card">
                <div class="restaurant-header">
                    <div>
                        <div class="restaurant-name">${restaurant.name}</div>
                        <div class="restaurant-details">
                            <span class="tag">${restaurant.user}</span>
                            <span class="tag">${restaurant.type}</span>
                            <span class="tag">${restaurant.category}</span>
                        </div>
                    </div>
                    <div class="restaurant-actions">
                        <button class="btn btn-secondary btn-small" onclick="editRestaurant(${originalIndex})">수정</button>
                        <button class="btn btn-danger btn-small" onclick="deleteRestaurant(${originalIndex})">삭제</button>
                    </div>
                </div>
                ${restaurant.link ? `
                    <div class="restaurant-link">
                        <a href="${restaurant.link}" target="_blank">링크 보기</a>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// 모달 이벤트 설정
function setupModalEvents() {
    const modal = document.getElementById('restaurantModal');
    const form = document.getElementById('restaurantForm');
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 폼 제출 이벤트
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveRestaurant();
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// 식당 추가 모달 열기
function openAddModal() {
    document.getElementById('modalTitle').textContent = '식당 추가';
    document.getElementById('restaurantForm').reset();
    currentEditIndex = -1;
    document.getElementById('restaurantModal').style.display = 'block';
}

// 식당 수정 모달 열기
function editRestaurant(index) {
    const restaurant = restaurants[index];
    if (!restaurant) return;
    
    document.getElementById('modalTitle').textContent = '식당 수정';
    document.getElementById('modalUser').value = restaurant.user;
    document.getElementById('modalType').value = restaurant.type;
    document.getElementById('modalCategory').value = restaurant.category;
    document.getElementById('modalName').value = restaurant.name;
    document.getElementById('modalLink').value = restaurant.link || '';
    
    currentEditIndex = index;
    document.getElementById('restaurantModal').style.display = 'block';
}

// 모달 닫기
function closeModal() {
    document.getElementById('restaurantModal').style.display = 'none';
    currentEditIndex = -1;
}

// 식당 저장
function saveRestaurant() {
    const user = document.getElementById('modalUser').value.trim() || '본인';
    const type = document.getElementById('modalType').value.trim();
    const category = document.getElementById('modalCategory').value.trim();
    const name = document.getElementById('modalName').value.trim();
    const link = document.getElementById('modalLink').value.trim();
    
    if (!type || !category || !name) {
        showToast('모든 필수 항목을 입력해주세요.', 'error');
        return;
    }
    
    // 중복 검증 (수정 시에는 현재 항목 제외)
    const duplicateIndex = restaurants.findIndex((restaurant, index) => 
        restaurant.user === user && 
        restaurant.type === type && 
        restaurant.category === category && 
        restaurant.name === name &&
        index !== currentEditIndex
    );
    
    if (duplicateIndex !== -1) {
        showToast('동일한 사용자의 같은 식당/시간/카테고리 조합이 이미 존재합니다.', 'error');
        return;
    }
    
    const restaurantData = {
        user,
        type,
        category,
        name,
        link: link || null
    };
    
    if (currentEditIndex === -1) {
        // 새로 추가
        restaurants.push(restaurantData);
        showToast('식당이 추가되었습니다.', 'success');
    } else {
        // 수정
        restaurants[currentEditIndex] = restaurantData;
        showToast('식당 정보가 수정되었습니다.', 'success');
    }
    
    saveDataToStorage();
    updateStats();
    updateFilterOptions();
    updateRecommendOptions();
    renderRestaurantList();
    closeModal();
}

// 식당 삭제
function deleteRestaurant(index) {
    if (confirm('정말로 이 식당을 삭제하시겠습니까?')) {
        const restaurant = restaurants[index];
        restaurants.splice(index, 1);
        saveDataToStorage();
        updateStats();
        updateFilterOptions();
        updateRecommendOptions();
        renderRestaurantList();
        showToast(`"${restaurant.name}"이(가) 삭제되었습니다.`, 'success');
    }
}

// 랜덤 추천
function getRandomRecommendation() {
    const user = document.getElementById('recommendUser').value;
    const type = document.getElementById('recommendType').value;
    const category = document.getElementById('recommendCategory').value;
    
    if (!user) {
        showToast('사용자를 선택해주세요.', 'error');
        return;
    }
    
    // 조건에 맞는 식당 필터링
    let filteredRestaurants = restaurants.filter(restaurant => {
        const matchUser = restaurant.user === user;
        const matchType = !type || restaurant.type === type;
        const matchCategory = !category || restaurant.category === category;
        
        return matchUser && matchType && matchCategory;
    });
    
    if (filteredRestaurants.length === 0) {
        showToast('조건에 맞는 식당이 없습니다.', 'warning');
        document.getElementById('recommendationResult').style.display = 'none';
        return;
    }
    
    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
    const selectedRestaurant = filteredRestaurants[randomIndex];
    
    // 결과 표시
    document.getElementById('resultName').textContent = selectedRestaurant.name;
    document.getElementById('resultUser').textContent = selectedRestaurant.user;
    document.getElementById('resultType').textContent = selectedRestaurant.type;
    document.getElementById('resultCategory').textContent = selectedRestaurant.category;
    
    const resultLink = document.getElementById('resultLink');
    if (selectedRestaurant.link) {
        resultLink.style.display = 'block';
        resultLink.querySelector('a').href = selectedRestaurant.link;
    } else {
        resultLink.style.display = 'none';
    }
    
    document.getElementById('recommendationResult').style.display = 'block';
    showToast('랜덤 추천이 완료되었습니다!', 'success');
}

// 데이터 다운로드
function downloadData() {
    if (restaurants.length === 0) {
        showToast('다운로드할 데이터가 없습니다.', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(restaurants, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `restaurants_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showToast('데이터가 다운로드되었습니다.', 'success');
}

// 데이터 업로드
function uploadData() {
    const fileInput = document.getElementById('fileInput');
    const userInput = document.getElementById('uploadUser');
    const user = userInput.value.trim();
    
    if (!user) {
        showToast('사용자명을 입력해주세요.', 'error');
        return;
    }
    
    if (!fileInput.files.length) {
        showToast('업로드할 파일을 선택해주세요.', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const uploadedData = JSON.parse(e.target.result);
            
            if (!Array.isArray(uploadedData)) {
                throw new Error('올바른 형식의 JSON 파일이 아닙니다.');
            }
            
            let addedCount = 0;
            let skippedCount = 0;
            
            uploadedData.forEach(item => {
                // 필수 필드 검증
                if (!item.type || !item.category || !item.name) {
                    skippedCount++;
                    return;
                }
                
                // 사용자명을 입력받은 값으로 설정
                const restaurantData = {
                    user: user,
                    type: item.type,
                    category: item.category,
                    name: item.name,
                    link: item.link || null
                };
                
                // 중복 검증
                const isDuplicate = restaurants.some(existing => 
                    existing.user === restaurantData.user &&
                    existing.type === restaurantData.type &&
                    existing.category === restaurantData.category &&
                    existing.name === restaurantData.name
                );
                
                if (!isDuplicate) {
                    restaurants.push(restaurantData);
                    addedCount++;
                } else {
                    skippedCount++;
                }
            });
            
            if (addedCount > 0) {
                saveDataToStorage();
                updateStats();
                updateFilterOptions();
                updateRecommendOptions();
                renderRestaurantList();
            }
            
            showToast(`${addedCount}개 식당이 추가되었습니다. ${skippedCount}개는 중복 또는 오류로 건너뛰었습니다.`, 'success');
            
            // 입력 필드 초기화
            fileInput.value = '';
            userInput.value = '';
            
        } catch (error) {
            console.error('업로드 오류:', error);
            showToast('파일을 읽는 중 오류가 발생했습니다.', 'error');
        }
    };
    
    reader.readAsText(file);
}

// 모든 데이터 삭제
function clearAllData() {
    if (restaurants.length === 0) {
        showToast('삭제할 데이터가 없습니다.', 'warning');
        return;
    }
    
    const confirmMessage = `정말로 모든 데이터(${restaurants.length}개 식당)를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
    
    if (confirm(confirmMessage)) {
        restaurants = [];
        saveDataToStorage();
        updateStats();
        updateFilterOptions();
        updateRecommendOptions();
        renderRestaurantList();
        showToast('모든 데이터가 삭제되었습니다.', 'success');
    }
}

// 토스트 알림
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // 토스트 표시
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // 3초 후 토스트 숨기기
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3100);
}

// 파일 입력 이벤트 리스너
document.getElementById('fileInput').addEventListener('change', function() {
    const fileName = this.files.length > 0 ? this.files[0].name : '파일을 선택하세요';
    // 선택된 파일명을 표시하고 싶다면 여기에 UI 업데이트 코드 추가
});
