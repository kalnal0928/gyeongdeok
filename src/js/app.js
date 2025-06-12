// 급식 정보를 화면에 표시하는 메인 모듈

// 모듈 시스템이 지원되지 않는 환경에서는 script 태그로 API 파일을 먼저 불러와야 합니다.
// 이 예제에서는 직접 함수를 정의하여 사용합니다.

// 상수 정의
const SCHOOL_CODE = '7010536'; // 경덕중학교 코드 (실제 코드로 변경 필요)
const API_KEY = 'YOUR_API_KEY'; // 실제 API 키로 변경 필요

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
            </div>
        `;
    });
    
    mealListEl.innerHTML = html;
}

// 급식 정보 가져오기
async function fetchMealInfo(schoolCode, date = null) {
    // 현재 날짜 설정
    if (!date) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        date = `${year}${month}${day}`;
    }

    try {
        mealListEl.innerHTML = '<p class="loading">급식 정보를 불러오는 중...</p>';
        
        // NEIS 급식 API 호출
        const url = `https://open.neis.go.kr/hub/mealServiceDietInfo` +
                    `?KEY=${API_KEY}` +
                    `&Type=json` +
                    `&ATPT_OFCDC_SC_CODE=J10` +  // 경기도교육청 코드 (필요시 변경)
                    `&SD_SCHUL_CODE=${schoolCode}` +
                    `&MLSV_YMD=${date}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // API 응답 확인 및 처리
        if (data.RESULT && data.RESULT.CODE === 'INFO-200') {
            // 데이터가 없는 경우
            mealListEl.innerHTML = '<p class="no-meal">해당 날짜의 급식 정보가 없습니다.</p>';
            return;
        }
        
        if (!data.mealServiceDietInfo) {
            mealListEl.innerHTML = '<p class="error">급식 정보를 가져올 수 없습니다.</p>';
            return;
        }
        
        // 급식 정보 표시
        const meals = data.mealServiceDietInfo[1].row;
        displayMealInfo(meals);
        
    } catch (error) {
        console.error('급식 정보를 가져오는 중 오류 발생:', error);
        mealListEl.innerHTML = '<p class="error">급식 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 초기 급식 정보 로드
    fetchMealInfo(SCHOOL_CODE);
    
    // 추가 기능: 날짜 선택기 추가
    const dateSelector = document.createElement('div');
    dateSelector.className = 'date-selector';
    dateSelector.innerHTML = `
        <h3>날짜 선택</h3>
        <input type="date" id="date-picker">
        <button id="load-meal">급식 조회</button>
    `;
    
    // 날짜 선택기를 meal-info 섹션 위에 삽입
    const mealInfoSection = document.getElementById('meal-info');
    mealInfoSection.insertBefore(dateSelector, mealInfoSection.firstChild);
    
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
        fetchMealInfo(SCHOOL_CODE, selectedDate);
    });
});