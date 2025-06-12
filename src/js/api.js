// 급식 정보를 가져오는 API 모듈

// API 키를 환경 변수에서 가져옵니다
const API_KEY = process.env.NEIS_API_KEY || '2ea298b3d6124c4aa24823dd777110b3';

// 학교 코드와 교육청 코드 설정
const ATPT_OFCDC_SC_CODE = 'J10'; // 경기도교육청 코드 (지역에 맞게 변경 필요)
const SD_SCHUL_CODE = '7010536';  // 경덕중학교 코드 (실제 학교 코드로 변경 필요)

// 급식 정보를 가져오는 함수
async function getMealInfo(schoolCode = SD_SCHUL_CODE, date) {
    // 기본값 설정 (날짜가 없으면 오늘 날짜 사용)
    if (!date) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        date = `${year}${month}${day}`;
    }

    // NEIS 급식 API URL 구성
    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo` +
                `?KEY=${API_KEY}` +
                `&Type=json` +
                `&pIndex=1` +
                `&pSize=100` +
                `&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}` +  // 교육청 코드
                `&SD_SCHUL_CODE=${schoolCode}` +  // 학교 코드
                `&MLSV_YMD=${date}`;  // 날짜 (YYYYMMDD)
    
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
// 모듈 내보내기 부분을 수정
window.mealApi = {
    getMealInfo: getMealInfo,
    searchSchool: searchSchool
};