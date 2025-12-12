"""
White Theme Todo App - Flask Application
"""
import os
from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

# In-memory storage for todos
todos = []
todo_id_counter = 1

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/todos', methods=['GET'])
def get_todos():
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def add_todo():
    global todo_id_counter

    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'Missing text field'}), 400

    text = request.json.get('text', '').strip()

    if not text:
        return jsonify({'error': 'Todo text cannot be empty'}), 400

    new_todo = {
        'id': todo_id_counter,
        'text': text,
        'completed': False
    }
    todos.append(new_todo)
    todo_id_counter += 1
    return jsonify(new_todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.json
    for todo in todos:
        if todo['id'] == todo_id:
            if 'text' in data:
                todo['text'] = data['text']
            if 'completed' in data:
                todo['completed'] = data['completed']
            return jsonify(todo)
    return jsonify({'error': 'Todo not found'}), 404

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    global todos
    todos = [todo for todo in todos if todo['id'] != todo_id]
    return '', 204

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'app': 'todo-app'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='127.0.0.1', port=port, use_reloader=False)
