import { Component } from "./base-component.js";
import { DragTarget } from "../models/drag-drop.js";
import { Project, ProjectStatus } from "../models/project.js";
import { autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";

//project list
export class ProjectList extends Component<HTMLDivElement, HTMLElement> 
    implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const list = this.element.querySelector("ul")!;
            list.classList.add("droppable");
        }
    }

    @autobind
    dropHandler(event: DragEvent) {
        const list = this.element.querySelector("ul")!;
        list.classList.remove("droppable");

        const prjID = event.dataTransfer!.getData("text/plain");
        projectState.moveProject(prjID, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished)
    }

    @autobind
    dragLeaveHandler(event: DragEvent) {
        const list = this.element.querySelector("ul")!;
        list.classList.remove("droppable");
    }

    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("drop", this.dropHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter((project) => {
                if (this.type === "active" && project.status === ProjectStatus.Active) {
                    return true;
                }
                else if (this.type === "finished" && project.status === ProjectStatus.Finished) {
                    return true;
                }
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects() {
        const list = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        list.innerHTML = "";
        for (const project of this.assignedProjects) {
            new ProjectItem(list.id, project)
        }
    }
}