namespace App {
    //validation
    export interface Validatable {
        value: string | number;
        required?: boolean;
        min?: number;
        max?: number;
    }

    export function validate(input: Validatable) {
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
}