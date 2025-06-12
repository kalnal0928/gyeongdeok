// 급식 정보를 가져오는 API 모듈

// .env 파일에서 API 키를 가져오는 대신, 직접 변수에 할당
// 실제 배포 시에는 빌드 시스템을 통해 이 값을 교체하는 것이 좋습니다
const API_KEY = process.env.API_KEY || 'YOUR_API_KEY';

// 급식 정보를 가져오는 함수
async function getMealInfo(schoolCode, date) {
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
                `&ATPT_OFCDC_SC_CODE=B10` +  // 서울특별시교육청 코드 (필요시 변경)
                `&SD_SCHUL_CODE=${schoolCode}` +  // 학교 코드
                `&MLSV_YMD=${date}`;  // 날짜 (YYYYMMDD)
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // API 응답 확인 및 처리
        if (data.RESULT) {
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
                `&SCHUL_NM=${encodeURIComponent(schoolName)}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.RESULT) {
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

export { getMealInfo, searchSchool };