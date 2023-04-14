"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var App;
(function (App) {
    //Component Base Class
    class Component {
        constructor(templateId, hostElemetId, insertAtStart, newElementId) {
            this.templateElement = document.getElementById(templateId);
            this.hostElement = document.getElementById(hostElemetId);
            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild;
            if (newElementId) {
                this.element.id = newElementId;
            }
            this.attach(insertAtStart);
        }
        attach(insertAtStart) {
            this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
        }
    }
    App.Component = Component;
})(App || (App = {}));
var App;
(function (App) {
    class State {
        constructor() {
            this.listeners = [];
        }
        addListener(listenerFn) {
            this.listeners.push(listenerFn);
        }
    }
    class ProjectState extends State {
        constructor() {
            super();
            this.projects = [];
        }
        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            else {
                this.instance = new ProjectState();
                return this.instance;
            }
        }
        addProject(title, description, people) {
            const newProject = new App.Project(Math.random().toString(), title, description, people, App.ProjectStatus.Active);
            this.projects.push(newProject);
            this.updatelisteners();
        }
        moveProject(projectId, newStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updatelisteners();
            }
        }
        updatelisteners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice()); //call function with a copy of array
            }
        }
    }
    App.ProjectState = ProjectState;
    App.projectState = ProjectState.getInstance();
})(App || (App = {}));
var App;
(function (App) {
    function validate(input) {
        let isValid = true;
        if (input.required) {
            isValid = isValid && input.value.toString().trim().length !== 0;
        }
        if (typeof input.value === "string") {
            if (input.min != null) {
                isValid = isValid && input.value.length >= input.min;
            }
            if (input.max != null) {
                isValid = isValid && input.value.length <= input.max;
            }
        }
        if (typeof input.value === "number") {
            if (input.min != null) {
                isValid = isValid && input.value >= input.min;
            }
            if (input.max != null) {
                isValid = isValid && input.value <= input.max;
            }
        }
        return isValid;
    }
    App.validate = validate;
})(App || (App = {}));
var App;
(function (App) {
    //autobind
    function autobind(target, methodName, descriptor) {
        const originalMethod = descriptor.value;
        const adjDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }
        };
        return adjDescriptor;
    }
    App.autobind = autobind;
})(App || (App = {}));
/// <reference path="base-component.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../util/validation.ts" />
/// <reference path="../decorators/autobind.ts" />
var App;
(function (App) {
    //project input
    class ProjectInput extends App.Component {
        constructor() {
            super("project-input", "app", true, "user-input");
            this.titleInput = this.element.querySelector("#title");
            this.descriptionInput = this.element.querySelector("#description");
            this.peopleInput = this.element.querySelector("#people");
            this.configure();
        }
        configure() {
            this.element.addEventListener("submit", this.submitHandler);
        }
        renderContent() { }
        gatherUserInput() {
            const title = this.titleInput.value;
            const description = this.descriptionInput.value;
            const people = this.peopleInput.value;
            if (App.validate({ value: title, required: true }) &&
                App.validate({ value: description, required: true }) &&
                App.validate({ value: +people, required: true, min: 1, max: 5 })) {
                return [title, description, +people];
            }
            else {
                alert("Invalid Input!");
                return;
            }
        }
        clearInputs() {
            this.titleInput.value = "";
            this.descriptionInput.value = "";
            this.peopleInput.value = "";
        }
        submitHandler(e) {
            e.preventDefault();
            const userInput = this.gatherUserInput();
            if (userInput) {
                const [title, description, people] = userInput;
                App.projectState.addProject(title, description, people);
                this.clearInputs();
            }
        }
    }
    __decorate([
        App.autobind
    ], ProjectInput.prototype, "submitHandler", null);
    App.ProjectInput = ProjectInput;
})(App || (App = {}));
var App;
(function (App) {
    //project status
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    ;
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/drag-drop.ts" />
/// <reference path="../models/project.ts" />
var App;
(function (App) {
    //project item
    class ProjectItem extends App.Component {
        get persons() {
            if (this.project.people === 1) {
                return "1 Person";
            }
            else {
                return this.project.people + " Persons";
            }
        }
        constructor(hostId, project) {
            super("single-project", hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        dragStartHandler(event) {
            event.dataTransfer.setData("text/plain", this.project.id);
            event.dataTransfer.effectAllowed = "move";
        }
        ;
        dragEndHandler(event) {
            // console.log("Drag End");
        }
        ;
        configure() {
            this.element.addEventListener("dragstart", this.dragStartHandler);
            this.element.addEventListener("dragend", this.dragEndHandler);
        }
        renderContent() {
            this.element.querySelector("h2").textContent = this.project.title;
            this.element.querySelector("h3").textContent = this.persons + " Assigned";
            this.element.querySelector("p").textContent = this.project.description;
        }
    }
    __decorate([
        App.autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    App.ProjectItem = ProjectItem;
})(App || (App = {}));
/// <reference path="base-component.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-drop.ts" />
var App;
(function (App) {
    //project list
    class ProjectList extends App.Component {
        constructor(type) {
            super("project-list", "app", false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
                event.preventDefault();
                const list = this.element.querySelector("ul");
                list.classList.add("droppable");
            }
        }
        dropHandler(event) {
            const list = this.element.querySelector("ul");
            list.classList.remove("droppable");
            const prjID = event.dataTransfer.getData("text/plain");
            App.projectState.moveProject(prjID, this.type === "active" ? App.ProjectStatus.Active : App.ProjectStatus.Finished);
        }
        dragLeaveHandler(event) {
            const list = this.element.querySelector("ul");
            list.classList.remove("droppable");
        }
        configure() {
            this.element.addEventListener("dragover", this.dragOverHandler);
            this.element.addEventListener("drop", this.dropHandler);
            this.element.addEventListener("dragleave", this.dragLeaveHandler);
            App.projectState.addListener((projects) => {
                const relevantProjects = projects.filter((project) => {
                    if (this.type === "active" && project.status === App.ProjectStatus.Active) {
                        return true;
                    }
                    else if (this.type === "finished" && project.status === App.ProjectStatus.Finished) {
                        return true;
                    }
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }
        renderContent() {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector("ul").id = listId;
            this.element.querySelector("h2").textContent = this.type.toUpperCase() + " PROJECTS";
        }
        renderProjects() {
            const list = document.getElementById(`${this.type}-projects-list`);
            list.innerHTML = "";
            for (const project of this.assignedProjects) {
                new App.ProjectItem(list.id, project);
            }
        }
    }
    __decorate([
        App.autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        App.autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        App.autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    App.ProjectList = ProjectList;
})(App || (App = {}));
/// <reference path="./components/project-input.ts" />
/// <reference path="./components/project-item.ts" />
/// <reference path="./components/project-list.ts" />
var App;
(function (App) {
    new App.ProjectInput();
    new App.ProjectList("active");
    new App.ProjectList("finished");
})(App || (App = {}));
