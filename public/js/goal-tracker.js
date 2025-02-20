// 目标追踪系统的核心功能
class GoalTracker {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('goals')) || [];
        this.initializeUI();
        this.bindEvents();
    }

    initializeUI() {
        // 创建目标追踪界面
        const goalSection = document.createElement('section');
        goalSection.className = 'goal-tracker';
        goalSection.innerHTML = `
            <div class="goal-header">
                <h2>个人成长目标</h2>
                <button id="addGoalBtn" class="add-goal-btn">添加目标</button>
            </div>
            <div class="goals-list" id="goalsList"></div>
            <div id="goalModal" class="goal-modal">
                <div class="modal-content">
                    <h3>设置新目标</h3>
                    <input type="text" id="goalTitle" placeholder="目标名称">
                    <textarea id="goalDescription" placeholder="目标描述"></textarea>
                    <input type="date" id="goalDeadline">
                    <div class="modal-buttons">
                        <button id="saveGoalBtn">保存</button>
                        <button id="cancelGoalBtn">取消</button>
                    </div>
                </div>
            </div>
        `;

        // 插入到聊天容器之前
        document.querySelector('.chat-container').insertAdjacentElement('beforebegin', goalSection);
        this.renderGoals();
    }

    bindEvents() {
        const addBtn = document.getElementById('addGoalBtn');
        const modal = document.getElementById('goalModal');
        const saveBtn = document.getElementById('saveGoalBtn');
        const cancelBtn = document.getElementById('cancelGoalBtn');

        addBtn.addEventListener('click', () => modal.style.display = 'flex');
        cancelBtn.addEventListener('click', () => modal.style.display = 'none');
        saveBtn.addEventListener('click', () => this.saveGoal());

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    saveGoal() {
        const title = document.getElementById('goalTitle').value;
        const description = document.getElementById('goalDescription').value;
        const deadline = document.getElementById('goalDeadline').value;

        if (!title) return alert('请输入目标名称');

        const goal = {
            id: Date.now(),
            title,
            description,
            deadline,
            progress: 0,
            createdAt: new Date().toISOString(),
            milestones: []
        };

        this.goals.push(goal);
        this.saveToStorage();
        this.renderGoals();

        // 重置表单并关闭模态框
        document.getElementById('goalTitle').value = '';
        document.getElementById('goalDescription').value = '';
        document.getElementById('goalDeadline').value = '';
        document.getElementById('goalModal').style.display = 'none';
    }

    renderGoals() {
        const goalsList = document.getElementById('goalsList');
        goalsList.innerHTML = this.goals.map(goal => `
            <div class="goal-card" data-id="${goal.id}">
                <div class="goal-info">
                    <h3>${goal.title}</h3>
                    <p>${goal.description}</p>
                    <div class="goal-meta">
                        <span>截止日期: ${new Date(goal.deadline).toLocaleDateString()}</span>
                        <span>进度: ${goal.progress}%</span>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar" style="width: ${goal.progress}%"></div>
                </div>
                <div class="goal-actions">
                    <button onclick="goalTracker.updateProgress(${goal.id})">更新进度</button>
                    <button onclick="goalTracker.deleteGoal(${goal.id})">删除</button>
                </div>
            </div>
        `).join('');
    }

    updateProgress(goalId) {
        const progress = prompt('请输入新的进度 (0-100):', '0');
        if (progress === null) return;

        const newProgress = parseInt(progress);
        if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
            return alert('请输入0-100之间的数字');
        }

        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.progress = newProgress;
            this.saveToStorage();
            this.renderGoals();
        }
    }

    deleteGoal(goalId) {
        if (!confirm('确定要删除这个目标吗？')) return;

        this.goals = this.goals.filter(g => g.id !== goalId);
        this.saveToStorage();
        this.renderGoals();
    }

    saveToStorage() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }
}

// 初始化目标追踪系统
const goalTracker = new GoalTracker();