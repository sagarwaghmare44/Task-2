// Todo List Application
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.taskIdCounter = 1;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.taskCount = document.getElementById('taskCount');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }
    
    bindEvents() {
        // Add task events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Clear completed tasks
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
        
        // Auto-focus input on page load
        this.taskInput.focus();
    }
    
    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showInputError();
            return;
        }
        
        if (taskText.length > 100) {
            this.showInputError('Task is too long (max 100 characters)');
            return;
        }
        
        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        this.tasks.unshift(newTask); // Add to beginning for better UX
        this.taskInput.value = '';
        this.updateUI();
        this.animateTaskAddition();
        
        // Re-focus input for continuous task adding
        this.taskInput.focus();
    }
    
    showInputError(message = 'Please enter a task') {
        this.taskInput.style.borderColor = 'var(--danger-color)';
        this.taskInput.placeholder = message;
        
        setTimeout(() => {
            this.taskInput.style.borderColor = '';
            this.taskInput.placeholder = 'What needs to be done?';
        }, 2000);
        
        this.taskInput.focus();
    }
    
    deleteTask(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        
        if (taskElement) {
            taskElement.classList.add('removing');
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                this.updateUI();
            }, 300);
        }
    }
    
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.updateUI();
            this.animateTaskToggle(taskId);
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.updateUI();
    }
    
    clearCompletedTasks() {
        const completedTasks = this.tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) return;
        
        // Animate removal of completed tasks
        completedTasks.forEach(task => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                taskElement.classList.add('removing');
            }
        });
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.updateUI();
        }, 300);
    }
    
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }
    
    updateUI() {
        this.renderTasks();
        this.updateTaskCounter();
        this.updateEmptyState();
        this.updateClearButton();
    }
    
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        this.todoList.innerHTML = '';
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.todoList.appendChild(taskElement);
        });
    }
    
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute('data-task-id', task.id);
        
        li.innerHTML = `
            <label class="todo-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTask(${task.id})">
                <span class="checkmark"></span>
            </label>
            <span class="todo-text">${this.escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})" 
                    aria-label="Delete task">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return li;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateTaskCounter() {
        const activeTasks = this.tasks.filter(task => !task.completed);
        const count = activeTasks.length;
        const plural = count !== 1 ? 's' : '';
        
        this.taskCount.textContent = count;
        this.taskCount.parentElement.innerHTML = `<span id="taskCount">${count}</span> task${plural} remaining`;
    }
    
    updateEmptyState() {
        const filteredTasks = this.getFilteredTasks();
        const hasVisibleTasks = filteredTasks.length > 0;
        
        this.emptyState.classList.toggle('hidden', hasVisibleTasks);
        
        // Update empty state message based on current filter
        if (!hasVisibleTasks) {
            const messages = {
                all: {
                    title: 'No tasks yet',
                    subtitle: 'Add a task above to get started!'
                },
                active: {
                    title: 'No active tasks',
                    subtitle: 'All tasks are completed! 🎉'
                },
                completed: {
                    title: 'No completed tasks',
                    subtitle: 'Complete some tasks to see them here'
                }
            };
            
            const message = messages[this.currentFilter];
            this.emptyState.querySelector('h3').textContent = message.title;
            this.emptyState.querySelector('p').textContent = message.subtitle;
        }
    }
    
    updateClearButton() {
        const completedTasks = this.tasks.filter(task => task.completed);
        const hasCompletedTasks = completedTasks.length > 0;
        
        this.clearCompleted.disabled = !hasCompletedTasks;
        
        if (hasCompletedTasks) {
            this.clearCompleted.innerHTML = `
                <i class="fas fa-trash"></i>
                Clear Completed (${completedTasks.length})
            `;
        } else {
            this.clearCompleted.innerHTML = `
                <i class="fas fa-trash"></i>
                Clear Completed
            `;
        }
    }
    
    animateTaskAddition() {
        const firstTask = this.todoList.querySelector('.todo-item');
        if (firstTask) {
            firstTask.classList.add('adding');
            setTimeout(() => {
                firstTask.classList.remove('adding');
            }, 300);
        }
    }
    
    animateTaskToggle(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.transform = 'scale(0.95)';
            setTimeout(() => {
                taskElement.style.transform = '';
            }, 150);
        }
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + / to focus input
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.taskInput.focus();
            }
            
            // Escape to clear input
            if (e.key === 'Escape' && document.activeElement === this.taskInput) {
                this.taskInput.value = '';
                this.taskInput.blur();
            }
        });
    }
    
    // Local storage functionality (bonus feature)
    saveToLocalStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            localStorage.setItem('todoFilter', this.currentFilter);
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            const savedFilter = localStorage.getItem('todoFilter');
            
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
                // Restore taskIdCounter
                if (this.tasks.length > 0) {
                    this.taskIdCounter = Math.max(...this.tasks.map(t => t.id)) + 1;
                }
            }
            
            if (savedFilter) {
                this.setFilter(savedFilter);
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            this.tasks = [];
        }
    }
    
    // Auto-save functionality
    enableAutoSave() {
        // Save whenever tasks change
        const originalAddTask = this.addTask.bind(this);
        const originalDeleteTask = this.deleteTask.bind(this);
        const originalToggleTask = this.toggleTask.bind(this);
        const originalClearCompleted = this.clearCompletedTasks.bind(this);
        
        this.addTask = () => {
            originalAddTask();
            this.saveToLocalStorage();
        };
        
        this.deleteTask = (taskId) => {
            originalDeleteTask(taskId);
            setTimeout(() => this.saveToLocalStorage(), 350);
        };
        
        this.toggleTask = (taskId) => {
            originalToggleTask(taskId);
            this.saveToLocalStorage();
        };
        
        this.clearCompletedTasks = () => {
            originalClearCompleted();
            setTimeout(() => this.saveToLocalStorage(), 350);
        };
    }
    
    // Initialize app with all features
    init() {
        this.loadFromLocalStorage();
        this.setupKeyboardShortcuts();
        this.enableAutoSave();
        this.updateUI();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    todoApp.init();
    
    // Add some sample tasks for demo (remove this in production)
    if (todoApp.tasks.length === 0) {
        // Uncomment below to add sample tasks
        /*
        todoApp.tasks = [
            { id: 1, text: 'Welcome to your new todo app!', completed: false, createdAt: new Date() },
            { id: 2, text: 'Try adding a new task', completed: false, createdAt: new Date() },
            { id: 3, text: 'Mark this task as complete', completed: false, createdAt: new Date() }
        ];
        todoApp.taskIdCounter = 4;
        todoApp.updateUI();
        */
    }
});

// Service Worker for offline functionality (bonus feature)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
