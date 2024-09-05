const initialData = {
    columns: {
        "column-1": { id: "column-1", title: "To Do", ticketIds: [] },
        "column-2": { id: "column-2", title: "In Progress", ticketIds: [] },
        "column-3": { id: "column-3", title: "Done", ticketIds: [] }
    },
    tickets: {},
    columnOrder: ["column-1", "column-2", "column-3"]
};

function createElement(tag, className, innerText) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerText) el.innerText = innerText;
    return el;
}

function renderBoard() {
    const root = document.getElementById("root");
    root.innerHTML = ''; // Clear previous content
    const boardContainer = createElement('div', 'board-container');

    initialData.columnOrder.forEach(columnId => {
        const column = initialData.columns[columnId];
        const columnElement = renderColumn(column);
        boardContainer.appendChild(columnElement);
    });

    root.appendChild(boardContainer);
}

function renderColumn(column) {
    const columnEl = createElement('div', 'column');
    const title = createElement('div', 'column-title', column.title);
    const addTicketButton = createElement('button', 'add-ticket-button', '+ Add Ticket');

    addTicketButton.addEventListener('click', () => addTicket(column.id));
    columnEl.appendChild(title);
    columnEl.appendChild(addTicketButton);

    const ticketContainer = createElement('div');
    ticketContainer.addEventListener('dragover', (e) => e.preventDefault());
    ticketContainer.addEventListener('drop', (e) => dropTicket(e, column.id));

    column.ticketIds.forEach((ticketId) => {
        const ticket = initialData.tickets[ticketId];
        const ticketEl = renderTicket(ticket, column.id);
        ticketContainer.appendChild(ticketEl);
    });

    columnEl.appendChild(ticketContainer);
    return columnEl;
}

function renderTicket(ticket, columnId) {
    const ticketEl = createElement('div', 'ticket');
    ticketEl.draggable = true;
    ticketEl.setAttribute('data-ticket-id', ticket.id);

    const title = createElement('h4');
    title.textContent = ticket.title;
    title.contentEditable = true;
    title.addEventListener('blur', () => updateTicketTitle(ticket.id, title.textContent));

    const description = createElement('p');
    description.textContent = ticket.description;
    description.contentEditable = true;
    description.addEventListener('blur', () => updateTicketDescription(ticket.id, description.textContent));

    const actionButtons = createElement('div', 'action-buttons');
    const deleteButton = createElement('button', 'cancel-button', 'Delete');

    deleteButton.addEventListener('click', () => deleteTicket(ticket.id, columnId));
    actionButtons.appendChild(deleteButton);
    ticketEl.appendChild(title);
    ticketEl.appendChild(description);
    ticketEl.appendChild(actionButtons);

    ticketEl.addEventListener('dragstart', (e) => dragTicket(e, ticket.id));

    return ticketEl;
}

function addTicket(columnId) {
    const newTicketId = `ticket-${Date.now()}`;
    const newTicket = { id: newTicketId, title: 'New Ticket', description: 'Description' };

    initialData.tickets[newTicketId] = newTicket;
    initialData.columns[columnId].ticketIds.push(newTicketId);

    renderBoard();
}

function deleteTicket(ticketId, columnId) {
    delete initialData.tickets[ticketId];
    const column = initialData.columns[columnId];
    column.ticketIds = column.ticketIds.filter(id => id !== ticketId);

    renderBoard();
}

function updateTicketTitle(ticketId, newTitle) {
    initialData.tickets[ticketId].title = newTitle;
}

function updateTicketDescription(ticketId, newDescription) {
    initialData.tickets[ticketId].description = newDescription;
}

function dragTicket(event, ticketId) {
    event.dataTransfer.setData("text/plain", ticketId);
}

function dropTicket(event, newColumnId) {
    const ticketId = event.dataTransfer.getData("text/plain");
    const oldColumnId = findColumnByTicketId(ticketId);

    if (oldColumnId !== newColumnId) {
        initialData.columns[oldColumnId].ticketIds = initialData.columns[oldColumnId].ticketIds.filter(id => id !== ticketId);
        initialData.columns[newColumnId].ticketIds.push(ticketId);
        renderBoard();
    }
}

function findColumnByTicketId(ticketId) {
    return initialData.columnOrder.find(columnId => initialData.columns[columnId].ticketIds.includes(ticketId));
}

renderBoard();