'use strict';

function init() {
    const todo_create = document.getElementById('todo_create');
    todo_create.onsubmit = shipit;
}

async function shipit(e) {
    e.preventDefault();

    const task = document.getElementById('todo_task').value;
    const done = document.getElementById('todo_done').value === "true";

    await fetch("/todos", {
        method: "POST",
        headers: [
            ["Content-Type", "application/json"],
        ],
        body: JSON.stringify({task,done})
    });

    window.location.href= '/';

    return false;
}

window.onload = init;
