//project class
enum ProjectStatus {Active, Finished};

class Project {
    constructor(public id: string, public title: string,
        public description: string, public people: number, public status: ProjectStatus) {

    }
}

//Project State Managment
type Listener<T> = (projects: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = []

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
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

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element : U;

    constructor(templateId: string, hostElemetId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElemetId) as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

//project list
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    configure() {
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
            const item = document.createElement("li");
            item.textContent = project.title;            
            list.appendChild(item);
        }
    }
}

//project input
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInput: HTMLInputElement;
    descriptionInput: HTMLInputElement;
    peopleInput: HTMLInputElement;


    constructor() {
        super("project-input", "app", true, "user-input");

        this.titleInput = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInput = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInput = this.element.querySelector("#people") as HTMLInputElement;

        this.configure();
    }

    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }

    renderContent(): void {}

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
}

const prjInput = new ProjectInput();

const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");