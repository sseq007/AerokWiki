// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDPR4SmSZaDH4HWzQ0rEcHw3iaLYEHo5pU",
  authDomain: "aerokwiki.firebaseapp.com",
  projectId: "aerokwiki",
  storageBucket: "aerokwiki.firebasestorage.app",
  messagingSenderId: "956823904537",
  appId: "1:956823904537:web:1d34e7dc951a68a33c2588"
};

// Initialize Firebase (Compat)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 전역에서 사용할 수 있게 함수 노출
window.db = db;

let isFirstLoad = true;

window.exportDataJs = function() {
    alert("Firebase 연동으로 인해 데이터가 클라우드에 실시간 저장됩니다. 파일을 내보낼 필요가 없습니다!");
};
window.saveToLocalStorage = function() {}; // 더 이상 사용 안 함

// 실시간 데이터베이스 동기화
db.collection("wikiDocs").onSnapshot((snapshot) => {
    // 1. Firebase 데이터베이스가 처음 만들어져서 비어있을 경우 기존 data.js 데이터를 업로드 (Seed)
    if (snapshot.empty && isFirstLoad) {
        console.log("Firebase가 비어있어 기본 데이터를 업로드합니다.");
        const existingKeys = Object.keys(window.wikiData || {});
        existingKeys.forEach(async (title) => {
            try {
                await db.collection("wikiDocs").doc(title).set(window.wikiData[title]);
            } catch(e) {
                console.error("초기 업로드 실패 (권한 없음):", e);
            }
        });
        return; // 등록 시 다시 이벤트 트리거되므로 종료
    }

    const newData = {};
    snapshot.forEach(docSnap => {
        newData[docSnap.id] = docSnap.data();
    });
    
    // 2. DB의 최신 데이터로 기존 클라이언트 데이터를 완전히 덮어씌움
    window.wikiData = newData;

    // 3. 첫 로드일 때 라우터 시작, 그 이후엔 백그라운드 갱신
    if (isFirstLoad) {
        isFirstLoad = false;
        initRouter();
        initEvents();
        renderSidebarData();
    } else {
        handleRoute(); // 현재 열려있는 페이지 내용 새로고침
        renderSidebarData();
    }
}, (error) => {
    console.error("데이터베이스 읽기 권한 에러:", error);
    if(isFirstLoad) {
        isFirstLoad = false;
        initRouter();
        initEvents();
        renderSidebarData();
    }
});

function initEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // 테마 토글 버튼 설정
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    if (themeToggle && themeIcon) {
        if (localStorage.getItem('theme') === 'dark') {
            themeIcon.textContent = '☀️';
        }
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeIcon.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.textContent = '☀️';
            }
        });
    }

    const doSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.hash = `/search/${encodeURIComponent(query)}`;
            searchInput.value = '';
        }
    };

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', doSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                doSearch();
            }
        });
    }
}

function renderSidebarData() {
    const popularList = document.getElementById('popularDocs');
    if (!popularList) return;

    const allTitles = Object.keys(window.wikiData || {});
    
    // 최종 수정일(lastModified) 기준 내림차순(최신순) 정렬
    const sortedTitles = allTitles.sort((a, b) => {
        const dateA = window.wikiData[a].lastModified || "0000-00-00 00:00";
        const dateB = window.wikiData[b].lastModified || "0000-00-00 00:00";
        return dateB.localeCompare(dateA); 
    });

    const popular = sortedTitles.slice(0, 5);
    
    if (popular.length === 0) {
        popularList.innerHTML = `<li><span style="color:var(--text-secondary); font-size:0.9em;">문서가 없습니다.</span></li>`;
        return;
    }

    popularList.innerHTML = popular.map(title => 
        `<li><a href="#/w/${encodeURIComponent(title)}">${title}</a></li>`
    ).join('');
}
