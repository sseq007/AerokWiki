// js/router.js
function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    // 앱 로드 시 현재 해시에 맞춰 라우팅 처리
    handleRoute();
}

function handleRoute() {
    const hash = window.location.hash || '#/home';
    const path = hash.replace('#', '');
    const parts = path.split('/').filter(Boolean);
    
    // 라우트가 변경될 때마다 화면 최상단으로 스크롤
    window.scrollTo(0, 0);

    const route = parts[0] || 'home';
    const param = parts[1] ? decodeURIComponent(parts[1]) : '';

    switch(route) {
        case 'home':
            renderWikiPage('에케위키:대문');
            break;
        case 'w': // 문서 읽기
            if (param) {
                renderWikiPage(param);
            } else {
                renderWikiPage('에케위키:대문');
            }
            break;
        case 'edit':
            if (param) renderEditPage(param);
            else window.location.hash = '#/home';
            break;
        case 'new':
            renderNewPage();
            break;
        case 'history':
            if (param) renderHistoryPage(param);
            else window.location.hash = '#/home';
            break;
        case 'search':
            renderSearchPage(param);
            break;
        case 'category':
            renderCategoryPage(param);
            break;
        case 'docs':
            renderAllDocs();
            break;
        case 'random':
            goToRandomPage();
            break;
        default:
            renderNotFound();
    }
}

function goToRandomPage() {
    // '대문' 문서를 제외한 문서 목록
    const titles = Object.keys(window.wikiData || {}).filter(t => t !== '에케위키:대문');
    if (titles.length === 0) {
        window.location.hash = '#/home';
        return;
    }
    const idx = Math.floor(Math.random() * titles.length);
    window.location.hash = `#/w/${encodeURIComponent(titles[idx])}`;
}
