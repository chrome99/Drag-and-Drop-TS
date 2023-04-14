namespace App {
    //Project State Managment
    type Listener<T> = (projects: T[]) => void;

    class State<T> {
        protected listeners: Listener<T>[] = []

        addListener(listenerFn: Listener<T>) {
            this.listeners.push(listenerFn);
        }
    }

    export class ProjectState extends State<Project> {
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

            this.updatelisteners();
        }

        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find(prj => prj.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updatelisteners();
            }
        }

        private updatelisteners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice()); //call function with a copy of array
            }
        }
    }

    export const projectState = ProjectState.getInstance();

}