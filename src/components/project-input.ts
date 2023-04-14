import { Component } from "./base-component";
import { validate } from "../util/validation";
import { autobind } from "../decorators/autobind";
import { projectState } from "../state/project-state";

//project input
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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