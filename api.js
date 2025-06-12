// 급식 정보를 가져오는 API 모듈

// API 키를 하드코딩된 값으로만 사용 (브라우저 환경)
const API_KEY = '2ea298b3d6124c4aa24823dd777110b3';

// 기본 학교 코드와 교육청 코드 설정 (선택된 학교가 없을 때 사용)
const DEFAULT_ATPT_OFCDC_SC_CODE = 'R10'; // 경상북도 교육청 코드
const DEFAULT_SD_SCHUL_CODE = '8791090';  // 경덕중학교 코드

// 식사 코드 상수
const MEAL_CODES = {
    BREAKFAST: '1', // 아침
    LUNCH: '2',     // 점심
    DINNER: '3'     // 저녁
};

/**
 * 급식 정보를 가져오는 함수
 * @param {string} schoolCode - 학교 코드
 * @param {string} date - 날짜 (YYYYMMDD 형식)
 * @param {string} mealCode - 식사 코드 (1: 아침, 2: 점심, 3: 저녁)
 * @returns {Promise<object>} - 급식 정보
 */
async function getMealInfo(schoolCode = DEFAULT_SD_SCHUL_CODE, date, mealCode = MEAL_CODES.LUNCH) {
    // 저장된 학교 정보가 있으면 사용
    let ATPT_OFCDC_SC_CODE;
    const savedSchool = localStorage.getItem('selectedSchool');
    if (savedSchool) {
        const { schoolCode: savedSchoolCode, eduCode } = JSON.parse(savedSchool);
        schoolCode = savedSchoolCode;
        ATPT_OFCDC_SC_CODE = eduCode;
    } else {
        // 저장된 정보가 없으면 기본값 사용
        schoolCode = schoolCode || DEFAULT_SD_SCHUL_CODE;
        ATPT_OFCDC_SC_CODE = DEFAULT_ATPT_OFCDC_SC_CODE;
    }

    // 기본값 설정 (날짜가 없으면 오늘 날짜 사용)
    if (!date) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        date = `${year}${month}${day}`;
    }

    // CORS 프록시를 URL 앞에 추가
    const corsProxy = "https://corsproxy.io/?";
    // NEIS 급식 API URL 구성
    const url = `${corsProxy}https://open.neis.go.kr/hub/mealServiceDietInfo` +
                `?KEY=${API_KEY}` +
                `&Type=json` +
                `&pIndex=1` +
                `&pSize=100` +
                `&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}` +  // 교육청 코드
                `&SD_SCHUL_CODE=${schoolCode}` +  // 학교 코드
                `&MLSV_YMD=${date}` +  // 날짜 (YYYYMMDD)
                `&MMEAL_SC_CODE=${mealCode}`;  // 식사 코드 (1: 아침, 2: 점심, 3: 저녁)
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // API 응답 확인 및 처리
        if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
            // 에러 발생 또는 데이터 없음
            return { success: false, message: data.RESULT.MESSAGE };
        }
        
        // 급식 정보 반환
        if (data.mealServiceDietInfo) {
            const meals = data.mealServiceDietInfo[1].row;
            return { success: true, data: meals };
        } else {
            return { success: false, message: '급식 정보가 없습니다.' };
        }
    } catch (error) {
        console.error('급식 정보를 가져오는 중 오류 발생:', error);
        return { success: false, message: '서버 오류가 발생했습니다.' };
    }
}

// 학교 검색 함수
async function searchSchool(schoolName) {
    const url = `https://open.neis.go.kr/hub/schoolInfo` +
                `?KEY=${API_KEY}` +
                `&Type=json` +
                `&pIndex=1` +
                `&pSize=100` +
                `&SCHUL_NM=${encodeURIComponent(schoolName)}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.RESULT && data.RESULT.CODE !== 'INFO-000') {
            return { success: false, message: data.RESULT.MESSAGE };
        }
        
        if (data.schoolInfo) {
            const schools = data.schoolInfo[1].row;
            return { success: true, data: schools };
        } else {
            return { success: false, message: '학교 정보가 없습니다.' };
        }
    } catch (error) {
        console.error('학교 정보를 검색하는 중 오류 발생:', error);
        return { success: false, message: '서버 오류가 발생했습니다.' };
    }
}

// 전역 객체에 함수 등록 (일반 브라우저용)
window.mealApi = {
    getMealInfo: getMealInfo,
    searchSchool: searchSchool,
    MEAL_CODES: MEAL_CODES // 식사 코드 상수도 내보내기
};