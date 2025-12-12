// White Theme Todo App JavaScript

let todos = [];
let currentFilter = 'all';

// Get the base path from the proxy (window.APP_BASE_PATH is injected by proxy)
const BASE_PATH = window.APP_BASE_PATH || '';
const apiBase = `${BASE_PATH}/api`;

console.log('Base path:', BASE_PATH);
console.log('API base:', apiBase);

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    setupEventListeners();
});

function setupEventListeners() {
    // Add todo on button click
    addBtn.addEventListener('click', addTodo);

    // Add todo on Enter key
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTodos();
        });
    });
}

async function loadTodos() {
    try {
        const response = await fetch(`${apiBase}/todos`);
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

async function addTodo() {
    const text = todoInput.value.trim();

    if (!text) {
        todoInput.focus();
        return;
    }

    try {
        const response = await fetch(`${apiBase}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`HTTP error! status: ${response.status}`, errorData);
            alert(`Failed to add todo: ${response.statusText}`);
            return;
        }

        const newTodo = await response.json();
        todos.push(newTodo);
        todoInput.value = '';
        todoInput.focus();
        renderTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo. Please try again.');
    }
}

async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
        const response = await fetch(`${apiBase}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !todo.completed })
        });

        const updated = await response.json();
        const index = todos.findIndex(t => t.id === id);
        todos[index] = updated;
        renderTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
    }
}

async function deleteTodo(id) {
    try {
        await fetch(`${apiBase}/todos/${id}`, {
            method: 'DELETE',
        });

        todos = todos.filter(t => t.id !== id);
        renderTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

function getFilteredTodos() {
    switch(currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    totalCount.textContent = `Total: ${total}`;
    completedCount.textContent = `Completed: ${completed}`;
}

function renderTodos() {
    const filtered = getFilteredTodos();
    todoList.innerHTML = '';

    if (todos.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <input
                type="checkbox"
                class="todo-checkbox"
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})">Delete</button>
        `;

        todoList.appendChild(li);
    });

    updateStats();
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
