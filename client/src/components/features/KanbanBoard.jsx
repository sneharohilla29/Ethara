import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#6B7280' },
  { id: 'todo', title: 'To Do', color: '#2563EB' },
  { id: 'in_progress', title: 'In Progress', color: '#D97706' },
  { id: 'in_review', title: 'In Review', color: '#8B5CF6' },
  { id: 'done', title: 'Done', color: '#059669' },
];

export default function KanbanBoard({ tasks = [], onStatusChange, onTaskClick }) {
  const groupedTasks = {};
  COLUMNS.forEach((col) => {
    groupedTasks[col.id] = [];
  });
  tasks.forEach((task) => {
    const status = task.status || 'todo';
    if (groupedTasks[status]) {
      groupedTasks[status].push(task);
    } else {
      groupedTasks.todo.push(task);
    }
  });

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    if (onStatusChange) {
      onStatusChange(draggableId, newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {COLUMNS.map((column) => (
          <div key={column.id} className="kanban-column">
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span
                  className="kanban-column-dot"
                  style={{ backgroundColor: column.color }}
                />
                <span className="kanban-column-name">{column.title}</span>
              </div>
              <span className="kanban-column-count">
                {groupedTasks[column.id].length}
              </span>
            </div>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  className="kanban-column-body"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: snapshot.isDraggingOver
                      ? 'var(--surface-hover)'
                      : undefined,
                  }}
                >
                  {groupedTasks[column.id].map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <TaskCard
                          task={task}
                          provided={dragProvided}
                          snapshot={dragSnapshot}
                          onClick={() => onTaskClick && onTaskClick(task)}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
