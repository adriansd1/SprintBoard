import React from "react";

const { useState } = React;
const { DragDropContext, Droppable, Draggable } = window.ReactBeautifulDnd;

const initialData = {
    "columns": {
        "column-1": {
            "id": "column-1",
            "title": "To Do",
            "ticketIds": []
        },
        "column-2": {
            "id": "column-2",
            "title": "In Progress",
            "ticketIds": []
        },
        "column-3": {
            "id": "column-3",
            "title": "Done",
            "ticketIds": []
        }
    },
    "tickets": {},
    "columnOrder": [
        "column-1",
        "column-2",
        "column-3"
    ]
};

const Board = () => {
    const [data, setData] = useState(initialData);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const start = data.columns[source.droppableId];
        const end = data.columns[destination.droppableId];

        if (start === end) {
            const newTicketIds = Array.from(start.ticketIds);
            newTicketIds.splice(source.index, 1);
            newTicketIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                ticketIds: newTicketIds,
            };

            setData({
                ...data,
                columns: {
                    ...data.columns,
                    [newColumn.id]: newColumn,
                },
            });
            return;
        }

        const startTicketIds = Array.from(start.ticketIds);
        startTicketIds.splice(source.index, 1);
        const newStart = {
            ...start,
            ticketIds: startTicketIds,
        };

        const endTicketIds = Array.from(end.ticketIds);
        endTicketIds.splice(destination.index, 0, draggableId);
        const newEnd = {
            ...end,
            ticketIds: endTicketIds,
        };

        setData({
            ...data,
            columns: {
                ...data.columns,
                [newStart.id]: newStart,
                [newEnd.id]: newEnd,
            },
        });
    };

    const updateTicket = (ticketId, updatedTicket) => {
        setData(prevData => ({
            ...prevData,
            tickets: {
                ...prevData.tickets,
                [ticketId]: {
                    ...prevData.tickets[ticketId],
                    ...updatedTicket
                }
            }
        }));
    };

    const addTicket = (columnId) => {
        const newTicketId = `ticket-${Date.now()}`;
        const newTicket = { id: newTicketId, title: 'New Ticket', description: 'Description' };

        setData(prevData => {
            const newColumn = {
                ...prevData.columns[columnId],
                ticketIds: [...prevData.columns[columnId].ticketIds, newTicketId]
            };

            return {
                ...prevData,
                tickets: {
                    ...prevData.tickets,
                    [newTicketId]: newTicket
                },
                columns: {
                    ...prevData.columns,
                    [columnId]: newColumn
                }
            };
        });
    };

    const deleteTicket = (ticketId, columnId) => {
        setData(prevData => {
            const newTickets = { ...prevData.tickets };
            delete newTickets[ticketId];

            const newColumn = {
                ...prevData.columns[columnId],
                ticketIds: prevData.columns[columnId].ticketIds.filter(id => id !== ticketId)
            };

            return {
                ...prevData,
                tickets: newTickets,
                columns: {
                    ...prevData.columns,
                    [columnId]: newColumn
                }
            };
        });
    };

    const exportToConsole = () => {
        console.log(JSON.stringify(data, null, 2));
    };

    // Add method to window object for exporting JSON
    window.SprintBoard = {
        outputJson: () => {
            console.log(JSON.stringify(data, null, 2));
            return data;
        }
    };

    return React.createElement(React.Fragment, null,
        React.createElement("button", { onClick: exportToConsole, style: { marginBottom: '20px', padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#2f80ed', color: 'white', cursor: 'pointer' } }, "Print JSON to Console"),
        React.createElement(DragDropContext, { onDragEnd },
            React.createElement("div", { className: "board-container" },
                data.columnOrder.map(columnId => {
                    const column = data.columns[columnId];
                    const tickets = column.ticketIds.map(ticketId => data.tickets[ticketId]);

                    return React.createElement(Column, { key: column.id, column, tickets, addTicket, deleteTicket, updateTicket });
                })
            )
        )
    );
};

const Column = ({ column, tickets, addTicket, deleteTicket, updateTicket }) => {
    return React.createElement("div", { className: "column" },
        React.createElement("div", { className: "column-title" }, column.title),
        React.createElement("button", { className: "add-ticket-button", onClick: () => addTicket(column.id) }, "+ Add Ticket"),
        React.createElement(Droppable, { droppableId: column.id },
            (provided) => React.createElement("div", { ...provided.droppableProps, ref: provided.innerRef },
                tickets.map((ticket, index) => React.createElement(Ticket, { key: ticket.id, ticket, index, deleteTicket: () => deleteTicket(ticket.id, column.id), updateTicket })),
                provided.placeholder
            )
        )
    );
};

const Ticket = ({ ticket, index, deleteTicket, updateTicket }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: ticket.title, description: ticket.description });

    const handleEdit = () => {
        updateTicket(ticket.id, editForm);
        setIsEditing(false);
    };

    return React.createElement(Draggable, { draggableId: ticket.id, index },
        (provided) => React.createElement("div", { className: "ticket", ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps },
            isEditing ? React.createElement("div", null,
                React.createElement("input", { className: "edit-ticket-input", value: editForm.title, onChange: e => setEditForm({ ...editForm, title: e.target.value }) }),
                React.createElement("textarea", { className: "edit-ticket-input", value: editForm.description, onChange: e => setEditForm({ ...editForm, description: e.target.value }) }),
                React.createElement("div", { className: "action-buttons" },
                    React.createElement("button", { className: "edit-ticket-button", onClick: handleEdit }, "Save"),
                    React.createElement("button", { className: "cancel-button", onClick: () => setIsEditing(false) }, "Cancel")
                )
            ) : React.createElement("div", null,
                React.createElement("h4", null, ticket.title),
                React.createElement("p", null, ticket.description),
                React.createElement("div", { className: "action-buttons" },
                    React.createElement("button", { className: "edit-ticket-button", onClick: () => setIsEditing(true) }, "Edit"),
                    React.createElement("button", { className: "cancel-button", onClick: deleteTicket }, "Delete")
                )
            )
        )
    );
};

ReactDOM.render(React.createElement(Board), document.getElementById('root'));