//project class
enum ProjectStatus {Active, Finished};

class Project {
    constructor(public id: string, public title: string,
        public description: string, public people: number, public status: ProjectStatus) {

    }
}

//Project State Managment
type Listener = (projects: Project[]) => void;

class ProjectState {
    private listeners: Listener[] = []
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {

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

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(Math.random().toString(),
        title, description, people, ProjectStatus.Active)
        this.projects.push(newProject);

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice()); //call function with a copy of array
        }
    }
}

const projectState = ProjectState.getInstance();

//validation
interface Validatable {
    value: string | number;
    required?: boolean;
    min?: number;
    max?: number;
}

function validate(input: Validatable) {
    let isValid = true;
    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0;
    }

    if(typeof input.value === "string") {
        if (input.min != null) {
            isValid = isValid && input.value.length >= input.min;
        }
        if (input.max != null) {
            isValid = isValid && input.value.length <= input.max;
        }
    }

    if(typeof input.value === "number") {
        if (input.min != null) {
            isValid = isValid && input.value >= input.min;
        }
        if (input.max != null) {
            isValid = isValid && input.value <= input.max;
        }
    }

    return isValid;
}

//autobind
function autobind (target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

//project list
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element : HTMLElement; //section element
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        this.templateElement = document.getElementById("project-list") as HTMLTemplateElement;
        this.hostElement = document.getElementById("app") as HTMLDivElement;
        this.assignedProjects = [];

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

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

        this.attach();

        this.renderContent();
    }

    private renderProjects() {
        const list = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        list.innerHTML = "";
        for (const project of this.assignedProjects) {
            const item = document.createElement("li");
            item.textContent = project.title;            
            list.appendChild(item);
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    private attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
}

//project input
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element : HTMLFormElement;
    titleInput: HTMLInputElement;
    descriptionInput: HTMLInputElement;
    peopleInput: HTMLInputElement;


    constructor() {
        this.templateElement = document.getElementById("project-input") as HTMLTemplateElement;
        this.hostElement = document.getElementById("app") as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

        this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInput = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInput = this.element.querySelector("#people") as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private gatherUserInput(): [string, string, number] | void {
        const title = this.titleInput.value;
        const description = this.descriptionInput.value;
        const people = this.peopleInput.value;

        if (validate({value: title, required: true}) &&
        validate({value: description, required: true}) &&
        validate({value: +people, required: true, min: 1, max: 5})) {
            return [title, description, +people]
        }
        else {
            alert("Invalid Input!");
            return;
        }
    }

    private clearInputs() {
        this.titleInput.value = "";
        this.descriptionInput.value = "";
        this.peopleInput.value = "";
    }

    @autobind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userInput = this.gatherUserInput();
        if (userInput) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}

const prjInput = new ProjectInput();

const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");