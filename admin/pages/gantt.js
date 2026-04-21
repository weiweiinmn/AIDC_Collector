/* ============================================================
   gantt.js — AIDC Collector 项目进度甘特图
   版本：v3.0 — 周历视图 + 横向缩放
   ============================================================ */

// ── 阶段定义 ──────────────────────────────────────────────
var STAGES = [
    { key: 'signing',  label: '签约',   color: '#8B5CF6' },
    { key: 'delivery', label: '交付',   color: '#0EA5E9' },
    { key: 'boi',      label: 'BOI',    color: '#F59E0B' },
    { key: 'purchase', label: '采购',   color: '#EC4899' },
    { key: 'entry',    label: '进场',   color: '#22C55E' },
    { key: 'compute',  label: '算力',   color: '#14B8A6' }
];

// ── 常量 ──────────────────────────────────────────────────
var STORAGE_KEY = 'aidc_gantt_data';
var DRAFT_KEY_TASK = 'gantt_draft_task';
var DRAFT_KEY_PROJ = 'gantt_draft_proj';
var ROW_H = 36;
var HEADER_H = 72;         // 表头高度（3行：年行20px + 月行24px + 周行28px）

// 获得某年的第几周（ISO周）
function getISOWeek(d) {
    var target = new Date(d.valueOf());
    var dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    var firstThursday = target.valueOf();
    target.setMonth(0, 1);
    var day = target.getDay();
    var days = firstThursday - target;
    return 1 + Math.ceil(days / 604800000);
}
var TL_W = 240;            // 左侧标签宽度
var MAX_HISTORY = 10;

// ── 缩放级别 ──────────────────────────────────────────────
var ZOOM_LEVELS = [
    { label: '半年', dayW: 3,  minColW: 21 },  // 0: 极紧凑
    { label: '季度', dayW: 6,  minColW: 42 },  // 1: 默认
    { label: '月',   dayW: 12, minColW: 84 },   // 2: 放大
    { label: '双周', dayW: 20, minColW: 140 },  // 3: 大
    { label: '周',   dayW: 32, minColW: 224 }, // 4: 最大
];
var zoomLevel = 1;         // 默认季度视图
var dayW = ZOOM_LEVELS[1].dayW;

// ── 全局状态 ──────────────────────────────────────────────
var projects = [];
var filterProj = 'all';
var filterStage = 'all';
var viewOffset = 0;
var today = new Date();
var historyStack = [];
var tooltipTimer = null;

// ── ID 生成 ──────────────────────────────────────────────
function generateId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function generateTaskId() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ── Mock 数据 ─────────────────────────────────────────────
function getDefaultProjects() {
    return [
        {
            id: 'proj1', name: 'AIMS - 吉隆坡', dcId: null, power: 3.0, expanded: true,
            tasks: [
                { id: 't1', projId: 'proj1', stage: 'signing',  name: '预计签约', start: '2026-01-06', end: '2026-02-28', pct: 100, note: '' },
                { id: 't2', projId: 'proj1', stage: 'signing',  name: '合同签署', start: '2026-03-01', end: '2026-03-15', pct: 80,  note: '法务审核中' },
                { id: 't3', projId: 'proj1', stage: 'delivery', name: '交付周期', start: '2026-03-15', end: '2026-06-30', pct: 10,  note: '' },
                { id: 't4', projId: 'proj1', stage: 'boi',      name: 'BOI审批',  start: '2026-04-01', end: '2026-05-31', pct: 0,   note: '' },
                { id: 't5', projId: 'proj1', stage: 'purchase', name: '设备采购', start: '2026-05-01', end: '2026-07-31', pct: 0,   note: '' },
                { id: 't6', projId: 'proj1', stage: 'entry',    name: '进场施工', start: '2026-07-01', end: '2026-09-30', pct: 0,   note: '' },
                { id: 't7', projId: 'proj1', stage: 'compute',  name: '算力上线', start: '2026-09-01', end: '2026-10-31', pct: 0,   note: '' }
            ]
        },
        {
            id: 'proj2', name: 'Digital River - 曼谷', dcId: null, power: 5.0, expanded: false,
            tasks: [
                { id: 't8',  projId: 'proj2', stage: 'signing',  name: '预计签约', start: '2026-02-01', end: '2026-03-31', pct: 60, note: '' },
                { id: 't9',  projId: 'proj2', stage: 'delivery', name: '交付周期', start: '2026-04-01', end: '2026-08-31', pct: 0,  note: '' },
                { id: 't10', projId: 'proj2', stage: 'boi',      name: 'BOI审批',  start: '2026-03-01', end: '2026-06-30', pct: 0,  note: '' },
                { id: 't11', projId: 'proj2', stage: 'purchase', name: '设备采购', start: '2026-06-01', end: '2026-08-31', pct: 0,  note: '' },
                { id: 't12', projId: 'proj2', stage: 'entry',    name: '进场施工', start: '2026-08-01', end: '2026-11-30', pct: 0,  note: '' },
                { id: 't13', projId: 'proj2', stage: 'compute',  name: '算力上线', start: '2026-11-01', end: '2026-12-31', pct: 0,  note: '' }
            ]
        }
    ];
}

// ── 数据存取 ──────────────────────────────────────────────
function loadProjects() {
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { console.error('加载数据失败', e); }
    return getDefaultProjects();
}

function saveProjects() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) { console.error('保存数据失败', e); }
}

// ── 历史记录 ──────────────────────────────────────────────
function pushHistory() {
    var snapshot = JSON.parse(JSON.stringify(projects));
    historyStack.push(snapshot);
    if (historyStack.length > MAX_HISTORY) historyStack.shift();
}

function undo() {
    if (historyStack.length === 0) { showToast('没有可撤销的操作'); return; }
    projects = historyStack.pop();
    saveProjects();
    renderAll();
    showToast('已撤销删除', 2000, true);
}

// ── 工具函数 ──────────────────────────────────────────────
function parseDate(s) {
    if (!s) return null;
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
}

function fmtDate(d) {
    if (!d || isNaN(d.getTime())) return '';
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
}

function addDays(d, n) {
    var r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
}

// 获得某天的周一
function getWeekStart(d) {
    var day = d.getDay(); // 0=Sun, 1=Mon...
    var diff = day === 0 ? -6 : 1 - day;
    return addDays(d, diff);
}

// 获得某天的周日
function getWeekEnd(d) {
    return addDays(getWeekStart(d), 6);
}

// 同一周返回true
function sameWeek(a, b) {
    return fmtDate(getWeekStart(a)) === fmtDate(getWeekStart(b));
}

function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function stageColor(key) {
    var s = STAGES.find(function(x) { return x.key === key; });
    return s ? s.color : '#64748B';
}

function stageLabel(key) {
    var s = STAGES.find(function(x) { return x.key === key; });
    return s ? s.label : key;
}

// ── 范围计算（对齐到周一，从2026 W4开始）───────────────────
function getGanttRange() {
    var allDates = [];
    projects.forEach(function(p) {
        p.tasks.forEach(function(t) {
            if (t.start) allDates.push(parseDate(t.start));
            if (t.end) allDates.push(parseDate(t.end));
        });
    });
    
    // 默认从2026 W4开始（约1月20日那一周）
    var defaultStart = new Date(2026, 0, 19); // 2026-01-19 是W4的周一
    var defaultEnd = addDays(defaultStart, 26 * 7 + 6); // 默认显示26周
    
    if (allDates.length === 0) {
        return { start: defaultStart, end: defaultEnd };
    }
    
    var minDate = new Date(Math.min.apply(null, allDates));
    var maxDate = new Date(Math.max.apply(null, allDates));
    
    // 范围以周为单位，前后各约13周（可根据缩放级别调整）
    var weeksToShow = 26;
    var center = addDays(new Date(today), viewOffset);
    var rangeStart = addDays(getWeekStart(center), -13 * 7);
    var rangeEnd = addDays(getWeekStart(center), 13 * 7 + 6);
    
    // 不早于2026 W4
    if (minDate < rangeStart || rangeStart < defaultStart) {
        rangeStart = defaultStart;
    }
    if (maxDate > rangeEnd) {
        rangeEnd = addDays(getWeekStart(maxDate), 13 * 7 + 6);
    }
    
    return { start: rangeStart, end: rangeEnd };
}

// ── 缩放控制 ──────────────────────────────────────────────
function setZoom(lvl) {
    if (lvl < 0 || lvl >= ZOOM_LEVELS.length) return;
    zoomLevel = lvl;
    dayW = ZOOM_LEVELS[lvl].dayW;
    // 渲染缩放按钮状态
    document.querySelectorAll('.zoom-btn').forEach(function(b, i) {
        b.classList.toggle('active', i === zoomLevel);
    });
    var label = document.getElementById('zoomLabel');
    if (label) label.textContent = ZOOM_LEVELS[zoomLevel].label;
    try { localStorage.setItem('gantt_zoom', zoomLevel); } catch(e) {}
    renderGantt();
}

function zoomIn() { setZoom(Math.min(zoomLevel + 1, ZOOM_LEVELS.length - 1)); }
function zoomOut() { setZoom(Math.max(zoomLevel - 1, 0)); }

// ── 筛选芯片 ──────────────────────────────────────────────
function renderFilterChips() {
    var stageChips = document.getElementById('stageChips');
    var stageHtml = '<span class="chip' + (filterStage === 'all' ? ' active' : '') + '" onclick="setFilter(\'stage\',\'all\')">全部</span>';
    var overdueCount = countOverdue();
    if (overdueCount > 0) {
        stageHtml += '<span class="chip' + (filterStage === 'overdue' ? ' active' : '') + '" onclick="setFilter(\'stage\',\'overdue\')" style="color:#EF4444;border-color:rgba(239,68,68,.3);">🔴 延期 (' + overdueCount + ')</span>';
    }
    STAGES.forEach(function(s) {
        stageHtml += '<span class="chip' + (filterStage === s.key ? ' active' : '') + '" onclick="setFilter(\'stage\',\'' + s.key + '\')">' + s.label + '</span>';
    });
    stageChips.innerHTML = stageHtml;
}

function countOverdue() {
    var c = 0, ts = fmtDate(today);
    projects.forEach(function(p) {
        p.tasks.forEach(function(t) {
            if (t.end && t.end < ts && t.pct < 100) c++;
        });
    });
    return c;
}

function setFilter(type, val) {
    if (type === 'proj') filterProj = val;
    else filterStage = val;
    renderAll();
}

// ── 日期导航 ──────────────────────────────────────────────
function navigateMonth(dir) {
    // 左右箭头改为缩放功能（横向放大/缩小时间轴）
    zoomLevel += dir;
    if (zoomLevel < 0) zoomLevel = 0;
    if (zoomLevel >= ZOOM_LEVELS.length) zoomLevel = ZOOM_LEVELS.length - 1;
    dayW = ZOOM_LEVELS[zoomLevel].dayW;
    document.querySelectorAll('.zoom-btn').forEach(function(b, i) {
        b.classList.toggle('active', i === zoomLevel);
    });
    var label = document.getElementById('zoomLabel');
    if (label) label.textContent = ZOOM_LEVELS[zoomLevel].label;
    try { localStorage.setItem('gantt_zoom', zoomLevel); } catch(e) {}
    renderGantt();
}

function navigateToday() {
    // 滚动到今天的位置
    viewOffset = 0;
    renderGantt();
    // 滚动到今天所在的周
    setTimeout(function() {
        var scrollEl = document.getElementById('gtScroll');
        var tableEl = document.getElementById('gtTable');
        if (!scrollEl || !tableEl) return;
        var todayStr = fmtDate(today);
        // 找到今天的格子位置
        var cells = tableEl.querySelectorAll('[data-date]');
        cells.forEach(function(cell) {
            if (cell.getAttribute('data-date') === todayStr) {
                var rect = cell.getBoundingClientRect();
                var containerRect = scrollEl.getBoundingClientRect();
                scrollEl.scrollLeft = cell.offsetLeft - containerRect.width / 2 + rect.width / 2;
            }
        });
    }, 50);
}

// ── 统计卡片 ──────────────────────────────────────────────
function renderStats() {
    var total = projects.length;
    var active = 0, done = 0, overdue = 0;
    var todayStr = fmtDate(today);

    projects.forEach(function(p) {
        var hasActive = false, allDone = p.tasks.length > 0;
        p.tasks.forEach(function(t) {
            if (t.end && t.end < todayStr && t.pct < 100) { overdue++; hasActive = true; }
            else if (t.pct > 0 && t.pct < 100) hasActive = true;
            if (t.pct < 100) allDone = false;
        });
        if (hasActive) active++;
        if (allDone && p.tasks.length > 0) done++;
    });

    setStat('statTotal', total);
    setStat('statActive', active, '#0EA5E9');
    setStat('statDone', done, '#22C55E');
    setStat('statOverdue', overdue > 0 ? overdue : '-', '#EF4444');
}

function setStat(id, val, color) {
    var el = document.getElementById(id);
    if (el) {
        var num = el.querySelector('.stat-num');
        if (num) {
            num.textContent = val;
            if (color) num.style.color = color;
        }
    }
}

// ── 阶段仪表盘 ────────────────────────────────────────────
function renderStageDash() {
    var stageData = {};
    STAGES.forEach(function(s) { stageData[s.key] = { total: 0, count: 0 }; });
    projects.forEach(function(p) {
        p.tasks.forEach(function(t) {
            if (stageData[t.stage]) { stageData[t.stage].total += t.pct; stageData[t.stage].count++; }
        });
    });

    var html = '';
    STAGES.forEach(function(s) {
        var d = stageData[s.key];
        var avg = d.count > 0 ? Math.round(d.total / d.count) : 0;
        html += '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">';
        html += '<span style="font-size:11px;color:var(--text-sec);width:36px;flex-shrink:0">' + s.label + '</span>';
        html += '<div style="width:80px;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden">';
        html += '<div style="width:' + avg + '%;height:100%;background:' + s.color + ';border-radius:3px;transition:width .3s"></div>';
        html += '</div>';
        html += '<span style="font-size:11px;color:var(--text-muted);width:28px;text-align:right;flex-shrink:0">' + avg + '%</span>';
        html += '</div>';
    });
    var el = document.getElementById('stageDash');
    if (el) el.innerHTML = html;
}

// ── 主渲染（周历）─────────────────────────────────────────
function renderGantt() {
    var range = getGanttRange();
    var totalDays = daysBetween(range.start, range.end);
    var totalWeeks = Math.ceil(totalDays / 7);

    var colW = Math.max(dayW, ZOOM_LEVELS[zoomLevel].minColW / 7);
    var tlCol = TL_W + 'px';
    var weekCols = '';
    for (var w = 0; w < totalWeeks; w++) weekCols += colW * 7 + 'px ';

    var visibleProjects = projects.filter(function(p) {
        return filterProj === 'all' || p.id === filterProj;
    });

    var todayStr = fmtDate(today);
    function taskMatchesFilter(t) {
        if (filterStage === 'all') return true;
        if (filterStage === 'overdue') return !!(t.end && t.end < todayStr && t.pct < 100);
        return t.stage === filterStage;
    }

    var rowCount = 1;
    visibleProjects.forEach(function(p) {
        rowCount++;
        if (p.expanded) {
            p.tasks.forEach(function(t) { if (taskMatchesFilter(t)) rowCount++; });
        }
    });

    var table = document.getElementById('gtTable');
    table.style.gridTemplateColumns = weekCols;
    table.style.gridTemplateRows = repeatStr(ROW_H + 'px ', rowCount);
    table.style.width = (totalWeeks * colW * 7) + 'px';

    var header = document.getElementById('gtHeader');
    header.style.gridTemplateColumns = weekCols;
    header.style.width = (totalWeeks * colW * 7) + 'px';
    header.style.height = HEADER_H + 'px';

    var headerHtml = '';

    // 第1行：年份行
    headerHtml += renderYearRow(range, totalWeeks, colW, 1);

    // 第2行：月份行
    headerHtml += renderMonthRow(range, totalWeeks, colW, 2);

    // 第3行：周行
    headerHtml += renderWeekRow(range, totalWeeks, colW, 3);

    header.innerHTML = headerHtml;

    // 左边列头部
    document.getElementById('gtHeaderLeft').innerHTML = '<span style="font-size:12px;font-weight:600;color:var(--text-sec);">项目 / 任务</span>';

    // 左边列（项目/任务名）
    var leftHtml = '';
    var leftRowIdx = 1;
    visibleProjects.forEach(function(proj) {
        leftHtml += buildProjectLeft(proj, leftRowIdx);
        leftRowIdx++;
        if (proj.expanded) {
            proj.tasks.forEach(function(task) {
                if (taskMatchesFilter(task)) {
                    leftHtml += buildTaskLeft(task, leftRowIdx);
                    leftRowIdx++;
                }
            });
            if (!proj.tasks.some(taskMatchesFilter)) {
                leftHtml += buildEmptyTaskLeft(leftRowIdx);
                leftRowIdx++;
            }
        }
    });
    document.getElementById('gtLeftContent').innerHTML = leftHtml;

    // 右边列（时间轴）
    var html = '';
    var rowIdx = 1;
    visibleProjects.forEach(function(proj) {
        html += buildProjectRight(proj, rowIdx, range, totalWeeks, colW);
        rowIdx++;
        if (proj.expanded) {
            var hasVisibleTask = false;
            proj.tasks.forEach(function(task) {
                if (taskMatchesFilter(task)) {
                    html += buildTaskRight(task, rowIdx, range, totalWeeks, colW);
                    rowIdx++;
                    hasVisibleTask = true;
                }
            });
            if (!hasVisibleTask) {
                html += buildEmptyTaskRight(rowIdx, totalWeeks);
                rowIdx++;
            }
        }
    });

    table.innerHTML = html;

    // 左边列行数同步
    var leftContent = document.getElementById('gtLeftContent');
    leftContent.style.gridTemplateRows = repeatStr(ROW_H + 'px ', rowCount);

    setupScrollSync();
    bindEvents();
    bindWeekClick(totalWeeks, colW);
}


// ── 左右滚动同步 ────────────────────────────────────────
var _syncLock = false;
function setupScrollSync() {
    var leftScroll = document.getElementById('gtScrollLeft');
    var rightScroll = document.getElementById('gtScroll');
    var headerOuter = document.getElementById('gtHeaderOuter');
    if (!leftScroll || !rightScroll) return;

    leftScroll.onscroll = function() {
        if (_syncLock) return;
        _syncLock = true;
        rightScroll.scrollTop = leftScroll.scrollTop;
        _syncLock = false;
    };
    rightScroll.onscroll = function() {
        if (_syncLock) return;
        _syncLock = true;
        leftScroll.scrollTop = rightScroll.scrollTop;
        // 表头横向跟随
        if (headerOuter) headerOuter.scrollLeft = rightScroll.scrollLeft;
        _syncLock = false;
    };
}// ── 月份行（跨多周）───────────────────────────────────────
function renderMonthRow(range, totalWeeks, colW, rowIdx) {
    var html = '';
    var cur = new Date(range.start);
    var curMonth = -1;
    var weekInMonth = 0;
    var monthSpans = []; // {month, year, colStart, colSpan}

    // 预计算每个月的周跨度
    var w = 0;
    while (w < totalWeeks) {
        var ws = getWeekStart(addDays(range.start, w * 7));
        var we = getWeekEnd(addDays(range.start, w * 7));
        var m = ws.getMonth(), y = ws.getFullYear();
        var key = y + '-' + m;
        if (m !== curMonth) {
            if (curMonth !== -1) monthSpans.push({ year: curYear, month: curMonth, span: weekInMonth, colStart: w - weekInMonth });
            curMonth = m; curYear = y; weekInMonth = 1;
        } else {
            weekInMonth++;
        }
        w++;
    }
    if (curMonth !== -1) monthSpans.push({ year: curYear, month: curMonth, span: weekInMonth, colStart: w - weekInMonth });

    // 生成月份单元格
    var colIdx = 1;
    monthSpans.forEach(function(ms) {
        html += '<div class="gt-tl-header" style="grid-column:' + colIdx + '/span ' + ms.span +
            ';grid-row:' + rowIdx + ';height:28px;display:flex;align-items:center;padding-left:8px;' +
            'font-size:11px;font-weight:600;color:var(--text-sec);' +
            'border-bottom:1px solid var(--border-mid);border-right:1px solid rgba(255,255,255,.04);' +
            'background:rgba(255,255,255,.02);">' +
            (ms.month + 1) + '月</div>';
        colIdx += ms.span;
    });

    return html;
}

// ── 年份行（跨多个月）────────────────────────────────────
function renderYearRow(range, totalWeeks, colW, rowIdx) {
    var html = '';
    var yearSpans = [];
    var yearStartWeek = 0;
    var lastYear = -1;

    // 遍历周，计算每年跨的周数
    var w = 0;
    while (w < totalWeeks) {
        var ws = getWeekStart(addDays(range.start, w * 7));
        var y = ws.getFullYear();
        if (y !== lastYear) {
            if (lastYear !== -1) {
                yearSpans.push({ year: lastYear, span: w - yearStartWeek, colStart: yearStartWeek });
            }
            lastYear = y;
            yearStartWeek = w;
        }
        w++;
    }
    if (lastYear !== -1) {
        yearSpans.push({ year: lastYear, span: w - yearStartWeek, colStart: yearStartWeek });
    }

    // 生成年份单元格
    var colIdx = 1;
    yearSpans.forEach(function(ys) {
        html += '<div class="gt-tl-header" style="grid-column:' + colIdx + '/span ' + ys.span +
            ';grid-row:' + rowIdx + ';height:20px;display:flex;align-items:center;padding-left:8px;' +
            'font-size:10px;font-weight:700;color:var(--text-muted);' +
            'border-bottom:1px solid var(--border);border-right:1px solid rgba(255,255,255,.04);' +
            'background:rgba(255,255,255,.015);">' +
            ys.year + '年</div>';
        colIdx += ys.span;
    });

    return html;
}

// ── 周行（显示周号 W1/W2/W3/W4）──────────────────────────────
var DOW_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
var selectedWeekIdx = -1;  // 当前选中的周索引

function renderWeekRow(range, totalWeeks, colW, rowIdx) {
    var html = '';
    var todayStr = fmtDate(today);

    for (var w = 0; w < totalWeeks; w++) {
        var wsDate = addDays(range.start, w * 7);
        var weDate = addDays(range.start, w * 7 + 6);
        var colStyle = 'grid-column:' + (w + 1) + ';grid-row:' + rowIdx +
            ';height:28px;display:flex;align-items:center;justify-content:center;' +
            'border-right:1px solid rgba(255,255,255,.04);' +
            'border-bottom:1px solid var(--border);';

        // 计算 ISO 周号
        var weekNum = getISOWeek(wsDate);
        var isThisWeek = todayStr >= fmtDate(wsDate) && todayStr <= fmtDate(weDate);

        // 周号标签
        var weekLabel = 'W' + weekNum;
        var weekBg = isThisWeek ? 'rgba(14,165,233,.15)' : '';
        var weekColor = isThisWeek ? 'color:var(--brand);font-weight:700;' : 'color:var(--text-muted);font-weight:500;';

        html += '<div class="week-cell" data-week-idx="' + w + '" style="' + colStyle + (weekBg ? 'background:' + weekBg + ';' : '') + '">';
        html += '<span style="font-size:12px;font-weight:600;' + weekColor + '">' + weekLabel + '</span>';
        html += '</div>';
    }

    return html;
}

// ── 周高亮 ────────────────────────────────────────────────
function selectWeek(weekIdx, totalWeeks, colW) {
    var headerHighlight = document.getElementById('gtHeaderWeekHighlight');
    var bodyHighlight = document.getElementById('gtWeekHighlight');
    if (!headerHighlight || !bodyHighlight) return;

    if (selectedWeekIdx === weekIdx) {
        // 再次点击取消选中
        selectedWeekIdx = -1;
        headerHighlight.classList.remove('active');
        bodyHighlight.classList.remove('active');
        return;
    }

    selectedWeekIdx = weekIdx;
    var left = weekIdx * colW * 7;
    var width = colW * 7;

    headerHighlight.style.left = left + 'px';
    headerHighlight.style.width = width + 'px';
    headerHighlight.classList.add('active');

    bodyHighlight.style.left = left + 'px';
    bodyHighlight.style.width = width + 'px';
    bodyHighlight.classList.add('active');
}

function bindWeekClick(totalWeeks, colW) {
    // 点击星期表头
    var weekCells = document.querySelectorAll('.week-cell');
    weekCells.forEach(function(cell) {
        cell.addEventListener('click', function() {
            var idx = parseInt(cell.getAttribute('data-week-idx'), 10);
            selectWeek(idx, totalWeeks, colW);
        });
    });

    // 点击内容区域的任意位置
    var gtScroll = document.getElementById('gtScroll');
    if (gtScroll) {
        gtScroll.addEventListener('click', function(e) {
            // 忽略点击甘特条
            if (e.target.closest('.gt-bar')) return;
            var rect = gtScroll.getBoundingClientRect();
            var scrollLeft = gtScroll.scrollLeft;
            var x = e.clientX - rect.left + scrollLeft;
            var weekIdx = Math.floor(x / colW);
            if (weekIdx >= 0 && weekIdx < totalWeeks) {
                selectWeek(weekIdx, totalWeeks, colW);
            }
        });
    }
}

// ── 左边列：项目行 ────────────────────────────────────────
function buildProjectLeft(proj, rowIdx) {
    var bg = proj.expanded ? 'var(--card-hover)' : 'var(--card)';
    var lkStyle = 'grid-row:' + rowIdx + ';height:' + ROW_H + 'px;background:' + bg + ';border-bottom:1px solid var(--border-mid);display:flex;align-items:center;';

    var totalTasks = proj.tasks.length;
    var completedTasks = proj.tasks.filter(function(t) { return t.pct === 100; }).length;
    var countHtml = totalTasks > 0 ? '<span style="font-size:11px;color:var(--text-muted);margin-left:8px;">' + completedTasks + '/' + totalTasks + ' 任务</span>' : '';

    // 日期显示
    var dateHtml = '';
    if (proj.startDate || proj.endDate) {
        var start = proj.startDate ? proj.startDate.slice(5) : '--';
        var end = proj.endDate ? proj.endDate.slice(5) : '--';
        dateHtml = '<span style="font-size:10px;color:var(--text-muted);margin-left:8px;flex-shrink:0;">' + start + ' ~ ' + end + '</span>';
    }

    var nameContent;
    if (proj.dcId) {
        nameContent = '<a href="datacenter-detail-v2.html?id=' + escHtml(proj.dcId) + '" target="_blank" onclick="event.stopPropagation()" style="font-size:13px;font-weight:600;color:var(--brand-light);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-decoration:none;">' + escHtml(proj.name) + ' <svg style="width:12px;height:12px;display:inline;vertical-align:middle;opacity:.6;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>';
    } else {
        nameContent = '<span style="font-size:13px;font-weight:600;color:var(--text-primary);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escHtml(proj.name) + '</span>';
    }

    var addBtnHtml = proj.expanded ? '<button class="btn-add-task" onclick="openNewTaskModal(\'' + proj.id + '\')" style="margin-left:8px;padding:2px 8px;border-radius:4px;font-size:11px;color:var(--brand);background:rgba(14,165,233,.1);border:1px solid rgba(14,165,233,.3);cursor:pointer;flex-shrink:0;">+ 任务</button>' : '';

    var lkContent = '<div class="proj-row" data-proj-id="' + proj.id + '" style="display:flex;align-items:center;width:100%;height:100%;padding:0 12px;gap:6px;cursor:pointer;">' +
        '<span class="proj-expand-btn" data-proj-id="' + proj.id + '" style="width:14px;height:14px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--text-sec);font-size:12px;flex-shrink:0;">' + (proj.expanded ? '▼' : '▶') + '</span>' +
        nameContent + countHtml + dateHtml + addBtnHtml + '</div>';

    return '<div style="' + lkStyle + '">' + lkContent + '</div>';
}

// ── 左边列：任务行 ────────────────────────────────────────
function buildTaskLeft(task, rowIdx) {
    var sc = stageColor(task.stage);
    var todayStr = fmtDate(today);
    var isOverdue = task.end && task.end < todayStr && task.pct < 100;
    var overdueDot = isOverdue ? '<span style="width:6px;height:6px;border-radius:50%;background:#EF4444;flex-shrink:0;margin-right:4px;" title="延期"></span>' : '';

    // 日期显示
    var dateHtml = '';
    if (task.start || task.end) {
        var start = task.start ? task.start.slice(5) : '--';
        var end = task.end ? task.end.slice(5) : '--';
        dateHtml = '<span class="task-date" data-task-id="' + task.id + '" data-proj-id="' + task.projId + '" style="font-size:10px;color:var(--text-muted);margin-left:8px;flex-shrink:0;cursor:text;">' + start + ' ~ ' + end + '</span>';
    }

    var lkStyle = 'grid-row:' + rowIdx + ';height:' + ROW_H + 'px;background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;';
    var lkContent = '<div class="gt-bar" data-task-id="' + task.id + '" data-proj-id="' + task.projId + '" style="display:flex;align-items:center;width:100%;height:100%;padding:0 12px 0 24px;cursor:pointer;">' +
        overdueDot +
        '<span class="task-name" data-task-id="' + task.id + '" data-proj-id="' + task.projId + '" style="font-size:12px;color:var(--text-primary);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:text;">' + escHtml(task.name) + '</span>' +
        '<span class="task-pct" data-task-id="' + task.id + '" data-proj-id="' + task.projId + '" style="font-size:11px;color:var(--text-sec);margin-left:8px;flex-shrink:0;cursor:text;">' + task.pct + '%</span>' +
        '<span style="width:8px;height:8px;border-radius:50%;background:' + sc + ';flex-shrink:0;margin-left:8px;"></span>' +
        dateHtml + '</div>';

    return '<div style="' + lkStyle + '">' + lkContent + '</div>';
}

// ── 左边列：空任务行 ──────────────────────────────────────
function buildEmptyTaskLeft(rowIdx) {
    var lkStyle = 'grid-row:' + rowIdx + ';height:' + ROW_H + 'px;background:rgba(0,0,0,.04);border-bottom:1px solid var(--border);display:flex;align-items:center;';
    return '<div style="' + lkStyle + '"><span style="font-size:11px;color:var(--text-muted);padding-left:24px;">无可见任务</span></div>';
}

// ── 右边列：项目行（只显示背景） ───────────────────────────
function buildProjectRight(proj, rowIdx, range, totalWeeks, colW) {
    var html = '';
    var bg = proj.expanded ? 'var(--card-hover)' : 'var(--card)';

    // 周格子（项目行只显示背景条）
    for (var w = 0; w < totalWeeks; w++) {
        var wsDate = addDays(range.start, w * 7);
        var weDate = addDays(range.start, w * 7 + 6);
        var todayStr = fmtDate(today);
        var isWeekWithToday = todayStr >= fmtDate(wsDate) && todayStr <= fmtDate(weDate);
        var cellBg = isWeekWithToday ? 'rgba(14,165,233,.06)' : '';

        var cellStyle = 'grid-column:' + (w + 1) + ';grid-row:' + rowIdx + ';height:' + ROW_H + 'px;position:relative;' +
            (cellBg ? 'background:' + cellBg + ';' : '') +
            'border-right:1px solid rgba(255,255,255,.04);';
        html += '<div style="' + cellStyle + '"></div>';
    }

    return html;
}

// ── 右边列：任务行（甘特条）───────────────────────────────
function buildTaskRight(task, rowIdx, range, totalWeeks, colW) {
    var sc = stageColor(task.stage);
    var html = '';

    // 周格子背景
    for (var w = 0; w < totalWeeks; w++) {
        var wsDate = addDays(range.start, w * 7);
        var weDate = addDays(range.start, w * 7 + 6);
        var todayStr = fmtDate(today);
        var isWeekWithToday = todayStr >= fmtDate(wsDate) && todayStr <= fmtDate(weDate);
        var cellBg = isWeekWithToday ? 'rgba(14,165,233,.06)' : '';

        var cellStyle = 'grid-column:' + (w + 1) + ';grid-row:' + rowIdx + ';height:' + ROW_H + 'px;position:relative;' +
            (cellBg ? 'background:' + cellBg + ';' : '') +
            'border-right:1px solid rgba(255,255,255,.04);';
        html += '<div style="' + cellStyle + '"></div>';
    }

    // 甘特条（绝对定位，基于整个表格容器）
    if (task.start && task.end) {
        var startOffset = daysBetween(range.start, task.start);
        var duration = daysBetween(task.start, task.end) + 1;

        var left = startOffset * colW;
        var width = duration * colW;
        if (width < 4) width = 4;

        // 行号从1开始，top 需要计算正确的 Y 坐标
        var barTop = (rowIdx - 1) * ROW_H + (ROW_H / 2 - 10);
        var pct = task.pct || 0;
        var barStyle = 'position:absolute;left:' + left + 'px;top:' + barTop + 'px;height:20px;width:' + width + 'px;background:rgba(30,41,59,0.8);border-radius:3px;cursor:pointer;z-index:5;overflow:hidden;';
        var fillStyle = 'position:absolute;left:0;top:0;height:100%;width:' + pct + '%;background:' + sc + ';border-radius:3px 0 0 3px;' + (pct >= 100 ? 'border-radius:3px;' : '');
        var textStyle = 'position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.5);z-index:2;';
        html += '<div class="gt-bar" data-task-id="' + task.id + '" data-proj-id="' + task.projId + '" style="' + barStyle + '" title="' + escHtml(task.name) + ' (' + pct + '%)">' +
            '<div style="' + fillStyle + '"></div>' +
            '<span style="' + textStyle + '">' + pct + '%</span>' +
            '</div>';
    }

    return html;
}

// ── 右边列：空任务行 ─────────────────────────────────────
function buildEmptyTaskRight(rowIdx, totalWeeks) {
    var html = '';
    for (var w = 0; w < totalWeeks; w++) {
        var cellStyle = 'grid-column:' + (w + 1) + ';grid-row:' + rowIdx + ';height:' + ROW_H + 'px;background:rgba(0,0,0,.04);border-right:1px solid rgba(255,255,255,.04);';
        html += '<div style="' + cellStyle + '"></div>';
    }
    return html;
}

// ── 事件绑定 ──────────────────────────────────────────────
function bindEvents() {
    setTimeout(function() {
        document.querySelectorAll('.gt-bar[data-task-id]').forEach(function(el) {
            el.removeEventListener('click', handleBarClick);
            el.addEventListener('click', handleBarClick);
            el.removeEventListener('mouseenter', handleBarEnter);
            el.removeEventListener('mouseleave', handleBarLeave);
            el.addEventListener('mouseenter', handleBarEnter);
            el.addEventListener('mouseleave', handleBarLeave);
        });

        document.querySelectorAll('.proj-expand-btn').forEach(function(el) {
            el.removeEventListener('click', handleExpandClick);
            el.addEventListener('click', handleExpandClick);
        });

        // 双击编辑任务名称
        document.querySelectorAll('.task-name').forEach(function(el) {
            el.removeEventListener('dblclick', handleTaskNameDblClick);
            el.addEventListener('dblclick', handleTaskNameDblClick);
        });

        // 双击编辑进度
        document.querySelectorAll('.task-pct').forEach(function(el) {
            el.removeEventListener('dblclick', handleTaskPctDblClick);
            el.addEventListener('dblclick', handleTaskPctDblClick);
        });

        // 双击编辑日期
        document.querySelectorAll('.task-date').forEach(function(el) {
            el.removeEventListener('dblclick', handleTaskDateDblClick);
            el.addEventListener('dblclick', handleTaskDateDblClick);
        });
    }, 0);
}

function handleBarClick(e) {
    // 如果点击的是可编辑元素，不处理
    if (e.target.classList.contains('task-name') || e.target.classList.contains('task-pct') || e.target.classList.contains('task-date')) return;
    e.stopPropagation();
    
    var taskId = e.currentTarget.getAttribute('data-task-id');
    var projId = e.currentTarget.getAttribute('data-proj-id');
    
    // 清除之前的高亮
    document.querySelectorAll('.task-highlight').forEach(function(el) {
        el.classList.remove('task-highlight');
        el.style.background = el.getAttribute('data-orig-bg') || '';
    });
    
    // 高亮左列任务行
    var leftRow = e.currentTarget;
    leftRow.classList.add('task-highlight');
    leftRow.setAttribute('data-orig-bg', leftRow.style.background || '');
    leftRow.style.background = 'rgba(14,165,233,0.15)';
    
    // 高亮时间轴进度条
    var timelineBar = document.querySelector('.gt-bar[data-task-id="' + taskId + '"][data-proj-id="' + projId + '"]:not(.gt-bar[data-task-id] .gt-bar)');
    if (timelineBar && timelineBar !== leftRow) {
        timelineBar.classList.add('task-highlight');
        timelineBar.setAttribute('data-orig-bg', timelineBar.style.background || '');
        timelineBar.style.background = timelineBar.style.background.replace('0.7', '1').replace('0.8', '1') || 'rgba(14,165,233,0.9)';
        timelineBar.style.boxShadow = '0 0 8px rgba(14,165,233,0.6)';
    }
}

function handleBarEnter(e) { showTooltip(e, e.currentTarget); }
function handleBarLeave(e) { hideTooltip(); }

// ── 双击编辑任务 ──────────────────────────────────────────
function handleTaskNameDblClick(e) {
    e.stopPropagation();
    var el = e.currentTarget;
    var taskId = el.getAttribute('data-task-id');
    var projId = el.getAttribute('data-proj-id');
    var proj = projects.find(function(p) { return p.id === projId; });
    var task = proj ? proj.tasks.find(function(t) { return t.id === taskId; }) : null;
    if (!task) return;

    var currentName = task.name;
    el.innerHTML = '<input type="text" class="inline-edit" value="' + escHtml(currentName) + '" style="width:100%;font-size:12px;background:var(--bg);border:1px solid var(--brand);border-radius:3px;padding:2px 4px;color:var(--text-primary);outline:none;">';
    var input = el.querySelector('input');
    input.focus();
    input.select();

    input.addEventListener('blur', function() {
        var newName = input.value.trim();
        if (newName && newName !== currentName) {
            task.name = newName;
            saveProjects();
            renderAll();
        } else {
            el.innerHTML = escHtml(currentName);
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') { el.innerHTML = escHtml(currentName); }
    });
}

function handleTaskPctDblClick(e) {
    e.stopPropagation();
    var el = e.currentTarget;
    var taskId = el.getAttribute('data-task-id');
    var projId = el.getAttribute('data-proj-id');
    var proj = projects.find(function(p) { return p.id === projId; });
    var task = proj ? proj.tasks.find(function(t) { return t.id === taskId; }) : null;
    if (!task) return;

    var currentPct = task.pct;
    el.innerHTML = '<input type="number" class="inline-edit" value="' + currentPct + '" min="0" max="100" style="width:40px;font-size:11px;background:var(--bg);border:1px solid var(--brand);border-radius:3px;padding:2px 4px;color:var(--text-primary);outline:none;">';
    var input = el.querySelector('input');
    input.focus();
    input.select();

    input.addEventListener('blur', function() {
        var newPct = Math.min(100, Math.max(0, parseInt(input.value) || 0));
        if (newPct !== currentPct) {
            task.pct = newPct;
            saveProjects();
            renderAll();
        } else {
            el.innerHTML = currentPct + '%';
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') { el.innerHTML = currentPct + '%'; }
    });
}

function handleTaskDateDblClick(e) {
    e.stopPropagation();
    var el = e.currentTarget;
    var taskId = el.getAttribute('data-task-id');
    var projId = el.getAttribute('data-proj-id');
    var proj = projects.find(function(p) { return p.id === projId; });
    var task = proj ? proj.tasks.find(function(t) { return t.id === taskId; }) : null;
    if (!task) return;

    var currentStart = task.start || '';
    var currentEnd = task.end || '';
    el.innerHTML = '<input type="date" class="inline-edit-start" value="' + currentStart + '" style="width:90px;font-size:10px;background:var(--bg);border:1px solid var(--brand);border-radius:3px;padding:2px;color:var(--text-primary);outline:none;"> ~ <input type="date" class="inline-edit-end" value="' + currentEnd + '" style="width:90px;font-size:10px;background:var(--bg);border:1px solid var(--brand);border-radius:3px;padding:2px;color:var(--text-primary);outline:none;">';
    var inputStart = el.querySelector('.inline-edit-start');
    var inputEnd = el.querySelector('.inline-edit-end');
    inputStart.focus();

    function saveDates() {
        var newStart = inputStart.value;
        var newEnd = inputEnd.value;
        task.start = newStart;
        task.end = newEnd;
        saveProjects();
        renderAll();
    }

    inputStart.addEventListener('blur', saveDates);
    inputEnd.addEventListener('blur', saveDates);

    inputStart.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { inputEnd.focus(); }
        if (e.key === 'Escape') { renderAll(); }
    });
    inputEnd.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { inputEnd.blur(); }
        if (e.key === 'Escape') { renderAll(); }
    });
}

function handleExpandClick(e) {
    e.stopPropagation();
    toggleProject(e.currentTarget.getAttribute('data-proj-id'));
}

// ── Tooltip ───────────────────────────────────────────────
function showTooltip(e, el) {
    var taskId = el.getAttribute('data-task-id');
    var projId = el.getAttribute('data-proj-id');
    var proj = projects.find(function(p) { return p.id === projId; });
    var task = proj ? proj.tasks.find(function(t) { return t.id === taskId; }) : null;
    if (!task) return;

    tooltipTimer = setTimeout(function() {
        var tooltip = document.getElementById('tooltip');
        var duration = task.start && task.end ? daysBetween(parseDate(task.start), parseDate(task.end)) + 1 : 0;
        var html = '<div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:4px;">' + escHtml(task.name) + '</div>';
        if (task.start && task.end) {
            html += '<div style="font-size:11px;color:#94A3B8;">' + task.start + ' → ' + task.end + ' (' + duration + '天)</div>';
        }
        html += '<div style="font-size:11px;color:' + stageColor(task.stage) + ';margin-top:4px;">进度：' + task.pct + '%</div>';
        if (task.note) html += '<div style="font-size:10px;color:#64748B;margin-top:4px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escHtml(task.note) + '</div>';

        tooltip.innerHTML = html;
        tooltip.style.display = 'block';

        var rect = el.getBoundingClientRect();
        var ttRect = tooltip.getBoundingClientRect();
        var left = rect.left + rect.width / 2 - ttRect.width / 2;
        var top = rect.top - ttRect.height - 8;
        if (left < 10) left = 10;
        if (left + ttRect.width > window.innerWidth - 10) left = window.innerWidth - ttRect.width - 10;
        if (top < 10) top = rect.bottom + 8;

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }, 300);
}

function hideTooltip() {
    clearTimeout(tooltipTimer);
    var tooltip = document.getElementById('tooltip');
    if (tooltip) tooltip.style.display = 'none';
}

// ── 项目折叠/展开 ─────────────────────────────────────────
function toggleProject(projId) {
    var proj = projects.find(function(p) { return p.id === projId; });
    if (proj) {
        proj.expanded = !proj.expanded;
        saveProjects();
        renderGantt();
    }
}

// ── Toast ────────────────────────────────────────────────
function showToast(msg, duration, showUndo) {
    duration = duration || 2000;
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.95);color:#fff;padding:10px 16px;border-radius:6px;font-size:13px;z-index:9999;display:flex;align-items:center;gap:12px;border:1px solid var(--border);';
    var html = '<span>' + msg + '</span>';
    if (showUndo) {
        html += '<button onclick="undo();this.parentElement.remove();" style="background:var(--brand);color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:12px;cursor:pointer;">撤销</button>';
    }
    toast.innerHTML = html;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity .3s';
        setTimeout(function() { toast.remove(); }, 300);
    }, duration);
}

// ── 任务弹窗 ──────────────────────────────────────────────
function openTaskModal(projId, taskId) {
    var proj = projects.find(function(p) { return p.id === projId; });
    var task = proj ? proj.tasks.find(function(t) { return t.id === taskId; }) : null;
    if (!task) return;

    document.getElementById('editProjId').value = projId;
    document.getElementById('editTaskId').value = taskId;

    var stageSelect = document.getElementById('editStage');
    stageSelect.innerHTML = STAGES.map(function(s) {
        return '<option value="' + s.key + '">' + s.label + '</option>';
    }).join('');
    stageSelect.value = task.stage;

    document.getElementById('editName').value = task.name;
    document.getElementById('editStart').value = task.start || '';
    document.getElementById('editEnd').value = task.end || '';
    document.getElementById('editPct').value = task.pct;
    document.getElementById('editNote').value = task.note || '';
    updatePctSlider(task.pct);

    document.getElementById('btnDelete').style.display = 'inline-flex';
    document.getElementById('taskModalTitle').textContent = '编辑任务';
    document.getElementById('taskModal').classList.add('active');
}

function openNewTaskModal(projId) {
    document.getElementById('editProjId').value = projId;
    document.getElementById('editTaskId').value = '';

    var stageSelect = document.getElementById('editStage');
    stageSelect.innerHTML = STAGES.map(function(s) {
        return '<option value="' + s.key + '">' + s.label + '</option>';
    }).join('');
    stageSelect.value = 'signing';

    document.getElementById('editName').value = '';
    document.getElementById('editStart').value = '';
    document.getElementById('editEnd').value = '';
    document.getElementById('editPct').value = 0;
    document.getElementById('editNote').value = '';
    updatePctSlider(0);

    document.getElementById('btnDelete').style.display = 'none';
    document.getElementById('taskModalTitle').textContent = '新建任务';
    document.getElementById('taskModal').classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    hideTooltip();
}

function saveTask() {
    var projId = document.getElementById('editProjId').value;
    var taskId = document.getElementById('editTaskId').value;
    var proj = projects.find(function(p) { return p.id === projId; });
    if (!proj) return;

    var startVal = document.getElementById('editStart').value;
    var endVal = document.getElementById('editEnd').value;
    if (startVal && endVal && startVal > endVal) { alert('结束日期不能早于开始日期'); return; }

    var taskData = {
        stage: document.getElementById('editStage').value,
        name: document.getElementById('editName').value.trim(),
        start: startVal, end: endVal,
        pct: Math.max(0, Math.min(100, parseInt(document.getElementById('editPct').value) || 0)),
        note: document.getElementById('editNote').value.trim()
    };

    if (!taskData.name) { alert('请输入任务名称'); return; }

    if (taskId) {
        var task = proj.tasks.find(function(t) { return t.id === taskId; });
        if (task) Object.assign(task, taskData);
    } else {
        taskData.id = generateTaskId();
        taskData.projId = projId;
        proj.tasks.push(taskData);
        proj.tasks.sort(function(a, b) {
            var ai = STAGES.findIndex(function(s) { return s.key === a.stage; });
            var bi = STAGES.findIndex(function(s) { return s.key === b.stage; });
            if (ai !== bi) return ai - bi;
            return (a.start || '').localeCompare(b.start || '');
        });
    }

    saveProjects();
    closeTaskModal();
    renderAll();
    showToast(taskId ? '任务已保存' : '任务已创建');
}

function deleteTask() {
    var projId = document.getElementById('editProjId').value;
    var taskId = document.getElementById('editTaskId').value;
    var proj = projects.find(function(p) { return p.id === projId; });
    if (!proj) return;
    var task = proj.tasks.find(function(t) { return t.id === taskId; });
    if (!task) return;
    if (!confirm('确定删除任务「' + task.name + '」？此操作可撤销。')) return;

    pushHistory();
    var idx = proj.tasks.findIndex(function(t) { return t.id === taskId; });
    if (idx > -1) { proj.tasks.splice(idx, 1); saveProjects(); closeTaskModal(); renderAll(); showToast('任务已删除', 3000, true); }
}

// ── 进度滑块 ──────────────────────────────────────────────
function updatePctSlider(val) {
    var slider = document.getElementById('pctSlider');
    var input = document.getElementById('editPct');
    if (slider) slider.value = val;
    if (input) input.value = val;
}

function onPctSliderChange(val) { document.getElementById('editPct').value = val; }
function onPctInputChange(val) {
    var num = Math.max(0, Math.min(100, parseInt(val) || 0));
    var slider = document.getElementById('pctSlider');
    if (slider) slider.value = num;
}

// ── 日期快捷 ──────────────────────────────────────────────
function setDateQuick(field, offset) {
    var d = addDays(new Date(), offset);
    document.getElementById(field).value = fmtDate(d);
}

// ── 草稿 ──────────────────────────────────────────────────
function saveDraft(key) {
    try {
        var data = {
            stage: document.getElementById('editStage').value,
            name: document.getElementById('editName').value,
            start: document.getElementById('editStart').value,
            end: document.getElementById('editEnd').value,
            pct: document.getElementById('editPct').value,
            note: document.getElementById('editNote').value,
            time: Date.now()
        };
        sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
}

function checkDraft(key) {
    try {
        var raw = sessionStorage.getItem(key);
        if (!raw) return;
        var data = JSON.parse(raw);
        if (Date.now() - data.time > 24 * 3600 * 1000) { sessionStorage.removeItem(key); return; }
        if (confirm('检测到未保存的草稿，是否恢复？')) {
            document.getElementById('editStage').value = data.stage;
            document.getElementById('editName').value = data.name;
            document.getElementById('editStart').value = data.start;
            document.getElementById('editEnd').value = data.end;
            document.getElementById('editPct').value = data.pct;
            document.getElementById('editNote').value = data.note;
            updatePctSlider(data.pct);
        }
    } catch (e) {}
}

function clearDraft(key) { try { sessionStorage.removeItem(key); } catch (e) {} }

// ── 项目弹窗 ──────────────────────────────────────────────
function loadDatacenters() {
    try {
        var raw = localStorage.getItem('aidc_datacenters');
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
}

function openProjectModal(projId) {
    var dcs = loadDatacenters();
    var dcSelect = document.getElementById('projDcSelect');
    var dcOptions = '<option value="">-- 暂不关联 --</option>';
    dcs.forEach(function(dc) {
        dcOptions += '<option value="' + escHtml(dc.id || '') + '">' + escHtml(dc.name || '(未命名)') + '</option>';
    });
    dcSelect.innerHTML = dcOptions;

    if (projId) {
        var proj = projects.find(function(p) { return p.id === projId; });
        if (proj) {
            document.getElementById('editProjId2').value = proj.id;
            document.getElementById('projName').value = proj.name;
            document.getElementById('projPower').value = proj.power || '';
            dcSelect.value = proj.dcId || '';
            document.getElementById('projOwner').value = proj.owner || '';
            document.getElementById('projStage').value = proj.stage || 'signing';
            document.getElementById('projStartDate').value = proj.startDate || '';
            document.getElementById('projEndDate').value = proj.endDate || '';
            document.getElementById('projNote').value = proj.note || '';
            document.getElementById('projModalTitle').textContent = '编辑项目';
            document.getElementById('btnDeleteProj').style.display = 'inline-flex';
        }
    } else {
        document.getElementById('editProjId2').value = '';
        document.getElementById('projName').value = '';
        document.getElementById('projPower').value = '';
        dcSelect.value = '';
        document.getElementById('projOwner').value = '';
        document.getElementById('projStage').value = 'signing';
        document.getElementById('projStartDate').value = '';
        document.getElementById('projEndDate').value = '';
        document.getElementById('projNote').value = '';
        document.getElementById('projModalTitle').textContent = '新建项目';
        document.getElementById('btnDeleteProj').style.display = 'none';
    }
    document.getElementById('projModal').classList.add('active');
}

function closeProjModal() { document.getElementById('projModal').classList.remove('active'); }

function saveProject() {
    var editId = document.getElementById('editProjId2').value;
    var name = document.getElementById('projName').value.trim();
    var power = parseFloat(document.getElementById('projPower').value) || 0;
    var dcId = document.getElementById('projDcSelect').value || null;
    var owner = document.getElementById('projOwner').value.trim();
    var stage = document.getElementById('projStage').value;
    var startDate = document.getElementById('projStartDate').value;
    var endDate = document.getElementById('projEndDate').value;
    var note = document.getElementById('projNote').value.trim();
    if (!name) { alert('请输入项目名称'); return; }

    if (editId) {
        var proj = projects.find(function(p) { return p.id === editId; });
        if (proj) {
            proj.name = name;
            proj.power = power;
            proj.dcId = dcId;
            proj.owner = owner;
            proj.stage = stage;
            proj.startDate = startDate;
            proj.endDate = endDate;
            proj.note = note;
        }
    } else {
        projects.push({
            id: generateId(),
            name: name,
            dcId: dcId,
            power: power,
            owner: owner,
            stage: stage,
            startDate: startDate,
            endDate: endDate,
            note: note,
            expanded: true,
            tasks: []
        });
    }

    saveProjects();
    closeProjModal();
    filterProj = 'all';
    renderAll();
    showToast(editId ? '项目已保存' : '项目已创建');
}

function deleteProject() {
    var editId = document.getElementById('editProjId2').value;
    if (!editId) return;
    var proj = projects.find(function(p) { return p.id === editId; });
    if (!proj) return;
    var taskCount = proj.tasks.length;
    var msg = taskCount > 0
        ? '确定删除项目「' + proj.name + '」及其 ' + taskCount + ' 个任务？此操作可撤销。'
        : '确定删除项目「' + proj.name + '」？此操作可撤销。';
    if (!confirm(msg)) return;

    pushHistory();
    var idx = projects.findIndex(function(p) { return p.id === editId; });
    if (idx > -1) { projects.splice(idx, 1); saveProjects(); closeProjModal(); renderAll(); showToast('项目已删除', 3000, true); }
}

// ── 导入/导出 ─────────────────────────────────────────────
function importData() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.xlsx,.xls';
    input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(evt) {
            try {
                if (file.name.endsWith('.json')) {
                    var data = JSON.parse(evt.target.result);
                    if (Array.isArray(data)) {
                        if (confirm('导入 ' + data.length + ' 个项目？当前数据将被覆盖。')) {
                            projects = data;
                            saveProjects();
                            renderAll();
                            showToast('导入成功');
                        }
                    }
                } else {
                    alert('Excel 导入需要引入 SheetJS 库，当前仅支持 JSON 导入');
                }
            } catch (err) { alert('导入失败：' + err.message); }
        };
        reader.readAsText(file);
    };
    input.click();
}

function exportData() {
    var dataStr = JSON.stringify(projects, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'AIDC-甘特图-导出-' + fmtDate(today).replace(/-/g, '') + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('导出成功');
}

function exportExcel() {
    var rows = [];
    rows.push(['项目名称', '关联机房', '设计功率(MW)', '任务阶段', '任务名称', '开始日期', '结束日期', '工期(天)', '进度(%)', '状态', '备注']);

    projects.forEach(function(p) {
        var dcName = p.dcId ? (loadDatacenters().find(function(d) { return d.id === p.dcId; }) || {}).name || '(未知)' : '(未关联)';
        if (p.tasks.length === 0) {
            rows.push([p.name, dcName, p.power, '', '', '', '', '', '', '', '']);
        } else {
            p.tasks.forEach(function(t) {
                var duration = t.start && t.end ? daysBetween(parseDate(t.start), parseDate(t.end)) + 1 : '';
                var status = t.pct === 100 ? '已完成' : (t.end && t.end < fmtDate(today) && t.pct < 100 ? '延期' : '进行中');
                rows.push([p.name, dcName, p.power, stageLabel(t.stage), t.name, t.start, t.end, duration, t.pct, status, t.note]);
            });
        }
    });

    var csv = rows.map(function(r) {
        return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');

    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'AIDC-甘特图-导出-' + fmtDate(today).replace(/-/g, '') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Excel 导出成功（CSV 格式）');
}

// ── 工具 ──────────────────────────────────────────────────
function repeatStr(s, n) {
    var r = '';
    for (var i = 0; i < n; i++) r += s;
    return r;
}

function renderAll() {
    renderStats();
    renderStageDash();
    renderFilterChips();
    renderGantt();
}

// ── 键盘快捷键 ────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (document.getElementById('taskModal').classList.contains('active')) closeTaskModal();
        else if (document.getElementById('projModal').classList.contains('active')) closeProjModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (document.getElementById('taskModal').classList.contains('active')) saveTask();
        else if (document.getElementById('projModal').classList.contains('active')) saveProject();
    }
    if (e.key === '+' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomIn(); }
    if (e.key === '-' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomOut(); }
    if (e.key === '=' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomIn(); }
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) return;
        alert('快捷键：\nEsc - 关闭弹窗\nCtrl+S - 保存\nCtrl++ - 放大\nCtrl+- - 缩小\n? - 显示帮助');
    }
});

// ── 初始化 ────────────────────────────────────────────────
function initGantt() {
    // 恢复缩放级别
    try {
        var savedZoom = parseInt(localStorage.getItem('gantt_zoom'));
        if (!isNaN(savedZoom) && savedZoom >= 0 && savedZoom < ZOOM_LEVELS.length) {
            zoomLevel = savedZoom;
            dayW = ZOOM_LEVELS[zoomLevel].dayW;
        }
    } catch(e) {}

    projects = loadProjects();
    renderAll();
    initResizer();
}

document.addEventListener('DOMContentLoaded', initGantt);

// ── 左列宽度拖拽调整 ──────────────────────────────────────
function initResizer() {
    var resizer = document.getElementById('gtResizer');
    var leftCol = document.getElementById('gtLeft');
    if (!resizer || !leftCol) return;

    var isDragging = false;
    var startX = 0;
    var startWidth = 0;

    resizer.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startWidth = leftCol.offsetWidth;
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var dx = e.clientX - startX;
        var newWidth = startWidth + dx;
        // 限制在 min-width 和 max-width 之间
        var minW = 120;
        var maxW = 400;
        if (newWidth < minW) newWidth = minW;
        if (newWidth > maxW) newWidth = maxW;
        leftCol.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        resizer.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
}
