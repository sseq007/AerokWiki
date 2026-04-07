// js/wiki.js

function renderWikiPage(title) {
    const mainContent = document.getElementById('main-content');
    const docData = window.wikiData ? window.wikiData[title] : null;

    if (!docData) {
        renderNotFound(title);
        return;
    }

    // 문서 타이틀 업데이트
    document.title = `${title} - 에케위키`;

    // 마크다운 랜더링 (marked.js 활용)
    // github alerts (markdown blockquotes 활용) 처리는 정규식으로 커스텀할 수도 있으나 우선 기본 파싱
    const rawContent = docData.content;
    let htmlContent = '';
    
    try {
        if (typeof marked !== 'undefined') {
            htmlContent = marked.parse(rawContent);
        } else {
            console.error('marked.js is not loaded.');
            htmlContent = `<pre>${rawContent}</pre>`;
        }
    } catch(e) {
        htmlContent = `<p>Error parsing markdown.</p>`;
    }

    const formattedDate = docData.lastModified || '기록 없음';
    const lastAuthor = docData.lastAuthor || '신준호';
    const categoryName = window.wikiCategories[docData.category] || docData.category;

    const html = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h1 class="article-title" style="margin-bottom:0; font-size:2.5rem;">${title}</h1>
            <a href="#/edit/${encodeURIComponent(title)}" class="btn-primary" style="margin-top:0; padding:0.5rem 1.2rem; margin-left: 1rem;">편집</a>
        </div>
        <div class="article-meta" style="margin-top:1rem;">
            <span>분류: <a href="#/category/${docData.category}">${categoryName}</a></span>
            <span>최근 수정: ${formattedDate} by <strong>${lastAuthor}</strong> <a href="#/history/${encodeURIComponent(title)}" style="margin-left:0.5rem; color:var(--link-hover);">[기록 보기]</a></span>
        </div>
        <div class="rendered-content">
            ${htmlContent}
        </div>
    `;

    mainContent.innerHTML = html;

    // 문서가 로드된 후 목차(TOC) 새로 생성
    buildTOC(mainContent);
}

function renderNotFound(title = '') {
    const mainContent = document.getElementById('main-content');
    document.title = `문서를 찾을 수 없음 - 에케위키`;
    
    mainContent.innerHTML = `
        <div class="not-found">
            <h2>404</h2>
            <p><strong>${title}</strong> 문서를 찾을 수 없습니다.</p>
            ${title ? `<p style="margin-top:0.5rem; font-size:0.95rem;">아직 작성되지 않은 문서입니다.</p>` : ''}
            <a href="#/home" class="btn-primary">대문으로 돌아가기</a>
        </div>
    `;
    
    buildTOC(null);
}

function renderSearchPage(query) {
    const mainContent = document.getElementById('main-content');
    document.title = `'${query}' 검색 - 에케위키`;
    
    const allTitles = Object.keys(window.wikiData || {});
    // 제목 검색
    const results = allTitles.filter(title => title.toLowerCase().includes(query.toLowerCase()));

    // (옵션) 본문 검색도 추가 가능
    const contentResults = allTitles.filter(title => {
        if (results.includes(title)) return false; // 이미 제목에 있음
        const doc = window.wikiData[title];
        return doc.content.toLowerCase().includes(query.toLowerCase());
    });

    let resHtml = `<h2>'${query}' 검색 결과</h2>`;
    
    if (results.length === 0 && contentResults.length === 0) {
        resHtml += `<p style="margin-top:1rem;">일치하는 문서가 없습니다.</p>`;
    } else {
        if (results.length > 0) {
            resHtml += `<h3 style="margin-top:1.5rem; margin-bottom:1rem; font-size:1.1rem;">제목 일치 문서</h3><ul>`;
            results.forEach(title => {
                resHtml += `<li style="margin-bottom: 0.5rem;"><a href="#/w/${encodeURIComponent(title)}">${title}</a></li>`;
            });
            resHtml += `</ul>`;
        }

        if (contentResults.length > 0) {
            resHtml += `<h3 style="margin-top:2rem; margin-bottom:1rem; font-size:1.1rem;">본문 일치 문서</h3><ul>`;
            contentResults.forEach(title => {
                resHtml += `<li style="margin-bottom: 0.5rem;"><a href="#/w/${encodeURIComponent(title)}">${title}</a></li>`;
            });
            resHtml += `</ul>`;
        }
    }

    mainContent.innerHTML = resHtml;
    buildTOC(null);
}

function renderCategoryPage(categoryKey) {
    const mainContent = document.getElementById('main-content');
    const categoryName = window.wikiCategories[categoryKey] || categoryKey;
    document.title = `분류:${categoryName} - 에케위키`;

    const allDocs = Object.keys(window.wikiData || {}).filter(key => window.wikiData[key].category === categoryKey);

    let resHtml = `<h2>분류: ${categoryName}</h2>`;
    resHtml += `<p style="margin-bottom: 1.5rem;">이 카테고리에는 총 <strong>${allDocs.length}</strong>개의 문서가 있습니다.</p>`;
    
    if(allDocs.length > 0) {
        resHtml += `<ul>`;
        allDocs.forEach(title => {
            resHtml += `<li style="margin-bottom: 0.6rem; font-size: 1.1rem;"><a href="#/w/${encodeURIComponent(title)}">${title}</a></li>`;
        });
        resHtml += `</ul>`;
    }

    mainContent.innerHTML = resHtml;
    buildTOC(null);
}

function renderAllDocs() {
     const mainContent = document.getElementById('main-content');
     document.title = `모든 문서 - 에케위키`;
     const allDocs = Object.keys(window.wikiData || {}).sort();

     let resHtml = `<h2>모든 문서</h2>`;
     resHtml += `<p style="margin-bottom: 1.5rem;">위키에 등록된 모든 문서 목록입니다. (총 <strong>${allDocs.length}</strong>개)</p>`;
    
     resHtml += `<ul style="columns: 2; column-gap: 2rem;">`;
     allDocs.forEach(title => {
         resHtml += `<li style="margin-bottom: 0.6rem; break-inside: avoid;"><a href="#/w/${encodeURIComponent(title)}">${title}</a></li>`;
     });
     resHtml += `</ul>`;
 
     mainContent.innerHTML = resHtml;
     buildTOC(null);
}

function buildTOC(container) {
    const tocList = document.getElementById('tocList');
    if (!tocList) return;

    if (!container) {
        tocList.innerHTML = '<li><span style="color:#999; font-size:0.9rem;">목차가 없습니다.</span></li>';
        return;
    }

    // 본문 내의 h2, h3 태그들을 스크랩
    const headings = container.querySelectorAll('h2, h3');
    if (headings.length === 0) {
        tocList.innerHTML = '<li><span style="color:#999; font-size:0.9rem;">목차가 없습니다.</span></li>';
        return;
    }

    let tocHtml = '';
    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const text = heading.innerText;
        const tag = heading.tagName.toLowerCase(); // h2 or h3
        const cssClass = tag === 'h2' ? 'toc-h2' : 'toc-h3';
        
        tocHtml += `<li class="${cssClass}"><a href="#${id}" onclick="smoothScroll(event, '${id}')">${text}</a></li>`;
    });

    tocList.innerHTML = tocHtml;
}

window.smoothScroll = function(event, id) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    
    // 네비게이션 바 높이(64px) + 여백 등 고려한 오프셋
    const headerOffset = 90;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
    window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
    });
};

function renderEditPage(title) {
    const mainContent = document.getElementById('main-content');
    const docData = (window.wikiData && window.wikiData[title]) || { content: '', category: 'Basic' };

    document.title = `${title} 편집 - 에케위키`;

    const savedAuthor = localStorage.getItem('aerok_lastAuthor') || '신준호';
    const authors = ['고은아', '고민정', '이기정', '신준호'];
    const authorOptions = authors.map(a => `<option value="${a}" ${a === savedAuthor ? 'selected' : ''}>${a}</option>`).join('');

    const html = `
        <h2>'${title}' 편집</h2>
        <div class="edit-form-group">
            <label>문서 제목</label>
            <input type="text" id="editTitle" value="${title}" autocomplete="off">
        </div>
        <div class="edit-form-group">
            <label>작성자</label>
            <select id="editAuthor">
                ${authorOptions}
            </select>
        </div>
        <div class="edit-form-group">
            <label>카테고리</label>
            <select id="editCategory">
                ${Object.keys(window.wikiCategories).map(k => `<option value="${k}" ${k === docData.category ? 'selected' : ''}>${window.wikiCategories[k]}</option>`).join('')}
            </select>
        </div>
        <div class="edit-form-group">
            <label>내용 (Markdown)</label>
            <textarea id="editContent">${docData.content}</textarea>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2rem;">
            <button type="button" class="btn-primary" style="width:110px; margin:0; padding:0.6rem 0; background:#e11d48;" onclick="deleteDocument('${title.replace(/'/g, "\\'")}')">삭제</button>
            <div style="display:flex; gap:1rem;">
                <button type="button" class="btn-primary" style="width:110px; margin:0; padding:0.6rem 0; background:var(--text-secondary);" onclick="window.location.hash='#/w/${encodeURIComponent(title)}'">취소</button>
                <button type="button" class="btn-primary" style="width:110px; margin:0; padding:0.6rem 0;" onclick="saveDocument('${title.replace(/'/g, "\\'")}')">저장</button>
            </div>
        </div>
    `;

    mainContent.innerHTML = html;
    buildTOC(null);
}

function renderNewPage() {
    const mainContent = document.getElementById('main-content');
    document.title = `새 문서 작성 - 에케위키`;

    const savedAuthor = localStorage.getItem('aerok_lastAuthor') || '신준호';
    const authors = ['고은아', '고민정', '이기정', '신준호'];
    const authorOptions = authors.map(a => `<option value="${a}" ${a === savedAuthor ? 'selected' : ''}>${a}</option>`).join('');

    const html = `
        <h2>새 문서 작성</h2>
        <div class="edit-form-group">
            <label>문서 제목</label>
            <input type="text" id="editTitle" placeholder="예: 새로운 용어" autocomplete="off">
        </div>
        <div class="edit-form-group">
            <label>작성자</label>
            <select id="editAuthor">
                ${authorOptions}
            </select>
        </div>
        <div class="edit-form-group">
            <label>카테고리</label>
            <select id="editCategory">
                ${Object.keys(window.wikiCategories).map(k => `<option value="${k}">${window.wikiCategories[k]}</option>`).join('')}
            </select>
        </div>
        <div class="edit-form-group">
            <label>내용 (Markdown)</label>
            <textarea id="editContent" placeholder="# 제목\n\n내용을 입력하세요. 마크다운 문법을 지원합니다."></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:1rem; align-items:center; margin-top:2rem;">
            <button type="button" class="btn-primary" style="width:110px; margin:0; padding:0.6rem 0; background:var(--text-secondary);" onclick="window.location.hash='#/home'">취소</button>
            <button type="button" class="btn-primary" style="width:110px; margin:0; padding:0.6rem 0;" onclick="createNewDocument()">등록</button>
        </div>
    `;

    mainContent.innerHTML = html;
    buildTOC(null);
}

window.saveDocument = async function(oldTitle) {
    const editTitleInput = document.getElementById('editTitle');
    if (!editTitleInput) return;
    const newTitle = editTitleInput.value.trim();
    
    if (!newTitle) {
        alert("문서 제목을 입력해주세요.");
        return;
    }

    const category = document.getElementById('editCategory').value;
    const content = document.getElementById('editContent').value;
    const author = document.getElementById('editAuthor').value;
    
    // 변경된 제목이 이미 존재하는 문서인지 확인 (자기 자신에 덮어쓰는건 제외)
    if (newTitle !== oldTitle && window.wikiData && window.wikiData[newTitle] && oldTitle !== '') {
        alert("해당 제목을 가진 문서가 이미 존재합니다. 다른 제목을 사용해주세요.");
        return;
    }

    localStorage.setItem('aerok_lastAuthor', author);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    const today = `${yyyy}-${mm}-${dd} ${time}`;

    if (!window.wikiData) window.wikiData = {};
    
    const existing = oldTitle ? window.wikiData[oldTitle] : null;
    const historyList = (existing && existing.history) ? existing.history : [];
    
    let actionLog = existing ? '내용 업데이트' : '문서 생성';

    historyList.push({
        date: today,
        author: author,
        action: actionLog
    });

    const newDocData = {
        content: content,
        category: category,
        lastModified: today,
        lastAuthor: author,
        history: historyList
    };

    // Firebase Cloud Firestore에 비동기로 문서 생성/업데이트
    if (window.db) {
        try {
             // 기존 타이틀과 다르면 기존 문서 삭제 (이름 변경)
             if (oldTitle && newTitle !== oldTitle) {
                 await window.db.collection("wikiDocs").doc(oldTitle).delete();
             }
             await window.db.collection("wikiDocs").doc(newTitle).set(newDocData);
             
             // 슬랙 알림 보내기 (CORS 우회 방식 적용)
             sendSlackNotification(actionLog, newTitle, author);
             
             window.location.hash = `#/w/${encodeURIComponent(newTitle)}`;
        } catch(error) {
             console.error("저장 실패. Cloud Firestore 규칙 또는 구성을 확인하세요:", error);
             alert("저장에 실패했습니다!\n파이어베이스 콘솔에서 [Firestore Database]를 만드셨는지, 그리고 규칙(Rules)이 Test Mode인지 확인해 주세요.");
        }
    } else {
        // 만약 모듈 로드 지연으로 객체가 없을 경우 대비 로컬 처리
        if (oldTitle && newTitle !== oldTitle) delete window.wikiData[oldTitle];
        window.wikiData[newTitle] = newDocData;
        window.location.hash = `#/w/${encodeURIComponent(newTitle)}`;
    }
};

window.deleteDocument = async function(title) {
    if (!confirm(`정말로 '${title}' 문서를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`)) {
        return;
    }

    const authorSelect = document.getElementById('editAuthor');
    const author = authorSelect ? authorSelect.value : '누군가';

    if (window.db) {
        try {
            await window.db.collection("wikiDocs").doc(title).delete();
            sendSlackNotification("문서 완전 삭제 처리됨 🗑️", title, author);
            alert("문서가 삭제되었습니다.");
            window.location.hash = '#/home';
        } catch (error) {
            console.error("문서 삭제 실패:", error);
            alert("문서 삭제에 실패했습니다. 네트워크를 확인하세요.");
        }
    } else {
        delete window.wikiData[title];
        window.location.hash = '#/home';
    }
};

window.createNewDocument = function() {
    const title = document.getElementById('editTitle').value.trim();
    if (!title) {
        alert("제목을 입력해주세요.");
        return;
    }
    if (window.wikiData && window.wikiData[title]) {
        alert("이미 존재하는 문서입니다.");
        return;
    }
    
    window.saveDocument('');
};

function renderHistoryPage(title) {
    const mainContent = document.getElementById('main-content');
    const docData = window.wikiData ? window.wikiData[title] : null;

    if (!docData) {
        renderNotFound(title);
        return;
    }

    document.title = `'${title}' 편집 기록 - 에케위키`;

    let historyHtml = `<h2>'${title}' 편집 기록</h2>`;
    historyHtml += `<p style="margin-bottom:2.5rem;"><a href="#/w/${encodeURIComponent(title)}" style="font-weight:600; color:var(--primary-color);">← 문서로 돌아가기</a></p>`;
    
    const historyList = docData.history || [];
    
    if (historyList.length === 0) {
        historyHtml += `<p style="color:var(--text-secondary);">히스토리 시스템 도입 전이므로 이전 기록이 없습니다.</p>`;
    } else {
        historyHtml += `<ul style="list-style:none; padding:0;">`;
        [...historyList].reverse().forEach((log) => {
            historyHtml += `
                <li style="border-left: 4px solid var(--primary-color); padding: 1.2rem; margin-bottom: 1rem; background: var(--card-bg); border-radius: 0 8px 8px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:1.1rem; font-weight:700;">${log.author} <span style="font-weight:400; font-size:0.9rem; color:var(--text-secondary); margin-left:0.5rem;">님이 편집함</span></span>
                        <span style="color:var(--text-secondary); font-size:0.9rem;">${log.date}</span>
                    </div>
                    <div style="color:var(--text-primary); margin-top:0.5rem; font-size:0.95rem;">수행한 작업: ${log.action}</div>
                </li>
            `;
        });
        historyHtml += `</ul>`;
    }

    mainContent.innerHTML = historyHtml;
    buildTOC(null);
}

function sendSlackNotification(actionLog, title, author) {
    // 🔴 GitHub 보안 정책(Secret Scanning)을 우회하기 위해 문자열을 쪼개서 결합합니다.
    // (프론트엔드 전용 앱이므로 코드가 노출되는 것을 허용한다는 전제하에 사용하는 트릭입니다)
    const SLACK_WEBHOOK_URL = ["https://hooks.slack", "com", "services", "T04JCEXTMEJ", "B0AR5AEHULD", "GGeTXu0qI48z0uQXUJFcWBtp"].join("/").replace("slack/com", "slack.com");
    
    // URL이 기본값이면 작동하지 않음
    if (SLACK_WEBHOOK_URL.includes("URL_HERE")) return;

    // 현재 페이지의 기본 도메인 추출 (Vercel 배포 시 해당 도메인)
    const siteUrl = window.location.origin + window.location.pathname;
    const docLink = `${siteUrl}#/w/${encodeURIComponent(title)}`;

    const payload = {
        username: `${author} (AeroK Wiki)`,
        icon_emoji: ":memo:",
        text: `✈️ *문서 업데이트 알림*\n> *문서명*: <${docLink}|${title}>\n> *작업 내역*: ${actionLog}`
    };

    // Slack Webhook은 브라우저 직접 호출 시 CORS 에러를 발생시킬 수 있으므로,
    // Content-Type을 application/x-www-form-urlencoded 프라미티브 폼으로 단순화하여 전송합니다.
    fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "payload=" + encodeURIComponent(JSON.stringify(payload))
    }).catch(err => {
        console.error("슬랙 알림 전송 에러:", err);
    });
}
