
export abstract class HelpCheckServiceBase {

    constructor() {

    }

    abstract check() : Promise<boolean>
    abstract origin(): string

}
