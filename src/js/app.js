// 급식 정보를 화면에 표시하는 메인 모듈

// DOM 요소
const mealListEl = document.getElementById('meal-list');

// 날짜 포맷팅 함수
function formatDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}년 ${month}월 ${day}일`;
}

// 급식 메뉴 포맷팅 함수 (알레르기 정보 처리)
function formatMenu(menuText) {
    if (!menuText) return '';
    
    // 알레르기 정보는 괄호 안에 숫자로 표시됨
    return menuText
        .replace(/\([0-9.]+\)/g, '<span class="allergy">$&</span>')
        .split('<br/>').join('</li><li>');
}

// 급식 정보 표시 함수
function displayMealInfo(meals) {
    if (!meals || meals.length === 0) {
        mealListEl.innerHTML = '<p class="no-meal">오늘은 급식 정보가 없습니다.</p>';
        return;
    }

    let html = '';
    
    meals.forEach(meal => {
        const date = formatDate(meal.MLSV_YMD);
        const menuName = meal.MMEAL_SC_NM; // 조식, 중식, 석식 구분
        const menuItems = formatMenu(meal.DDISH_NM);
        
        html += `
            <div class="meal-item">
                <h3>${date} ${menuName}</h3>
                <ul class="menu-list">
                    <li>${menuItems}</li>
                </ul>
                <p class="calorie">칼로리: ${meal.CAL_INFO}</p>
                <p class="origin">원산지: ${meal.ORPLC_INFO || '정보 없음'}</p>
            </div>
        `;
    });
    
    mealListEl.innerHTML = html;
}

// 급식 정보 가져오기
async function fetchMealInfo(date = null) {
    try {
        mealListEl.innerHTML = '<p class="loading">급식 정보를 불러오는 중...</p>';
        
        // api.js에서 정의한 함수 사용
        // window.mealApi가 있으면 그것을 사용하고, 없으면 직접 import된 함수 사용
        const mealApi = window.mealApi || { getMealInfo };
        const result = await mealApi.getMealInfo(undefined, date);
        
        if (!result.success) {
            mealListEl.innerHTML = `<p class="error">${result.message}</p>`;
            return;
        }
        
        // 급식 정보 표시
        displayMealInfo(result.data);
        
    } catch (error) {
        console.error('급식 정보를 가져오는 중 오류 발생:', error);
        mealListEl.innerHTML = '<p class="error">급식 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 초기 급식 정보 로드
    fetchMealInfo();
    
    // 날짜 선택기 추가
    const dateSelector = document.createElement('div');
    dateSelector.className = 'date-selector';
    dateSelector.innerHTML = `
        <h3>날짜 선택</h3>
        <input type="date" id="date-picker">
        <button id="load-meal">급식 조회</button>
    `;
    
    // 날짜 선택기를 meal-info 섹션 위에 삽입
    const mealInfoSection = document.getElementById('meal-info');
    mealInfoSection.insertBefore(dateSelector, mealInfoSection.firstChild.nextSibling);
    
    // 오늘 날짜를 기본값으로 설정
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById('date-picker').value = `${year}-${month}-${day}`;
    
    // 급식 조회 버튼 이벤트 리스너
    document.getElementById('load-meal').addEventListener('click', () => {
        const datePicker = document.getElementById('date-picker');
        const selectedDate = datePicker.value.replace(/-/g, '');
        fetchMealInfo(selectedDate);
    });
});